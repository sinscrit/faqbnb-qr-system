"""
Route Tracer - Maps routes to rendering components

This module traces routes mentioned in PRDs to their actual rendering components.
It supports multiple frontend frameworks and provides verified context to Agent 00.

Created: 2026-01-12
"""

import re
import json
from pathlib import Path
from typing import Optional
from dataclasses import dataclass, asdict
from enum import Enum


class Framework(Enum):
    """Supported frontend frameworks."""
    NEXTJS_APP_ROUTER = "nextjs_app_router"      # src/app/route/page.tsx
    NEXTJS_PAGES_ROUTER = "nextjs_pages_router"  # src/pages/route.tsx
    VITE_REACT_ROUTER = "vite_react_router"      # Check router config
    CREATE_REACT_APP = "create_react_app"        # Check router config
    UNKNOWN = "unknown"


@dataclass
class ComponentTrace:
    """Result of tracing a route to its component."""
    route: str
    page_file: Optional[str]
    page_file_exists: bool
    primary_component: Optional[str]
    component_directory: Optional[str]
    all_imports: list[str]
    framework: str
    verification_hints: list[str]
    error: Optional[str] = None


@dataclass
class RouteTraceResult:
    """Complete route trace results for a PRD."""
    prd_path: str
    project_root: str
    framework_detected: str
    routes_found: list[str]
    traces: list[ComponentTrace]
    summary: dict


class RouteTracer:
    """
    Traces routes to their rendering components.

    Usage:
        tracer = RouteTracer(project_root)
        result = tracer.trace_routes(['/dashboard2/create', '/dashboard2'])
        result.save('route_trace.json')
    """

    def __init__(self, project_root: Path):
        self.project_root = Path(project_root)
        self.framework = self._detect_framework()

    def _detect_framework(self) -> Framework:
        """Detect the frontend framework used by the project."""
        # Check for Next.js App Router (src/app directory)
        if (self.project_root / 'src' / 'app').exists():
            # Verify it has page.tsx files
            app_dir = self.project_root / 'src' / 'app'
            if list(app_dir.rglob('page.tsx')) or list(app_dir.rglob('page.jsx')):
                return Framework.NEXTJS_APP_ROUTER

        # Check for Next.js Pages Router (src/pages or pages directory)
        pages_dir = self.project_root / 'src' / 'pages'
        if not pages_dir.exists():
            pages_dir = self.project_root / 'pages'
        if pages_dir.exists():
            return Framework.NEXTJS_PAGES_ROUTER

        # Check for Vite with React Router
        if (self.project_root / 'vite.config.ts').exists():
            return Framework.VITE_REACT_ROUTER

        # Check for Create React App
        if (self.project_root / 'src' / 'index.tsx').exists():
            return Framework.CREATE_REACT_APP

        return Framework.UNKNOWN

    def _route_to_page_file(self, route: str) -> Path:
        """Convert a route to its page file path based on framework."""
        # Normalize route
        route = route.strip('/')

        if self.framework == Framework.NEXTJS_APP_ROUTER:
            # /dashboard2/create -> src/app/dashboard2/create/page.tsx
            base = self.project_root / 'src' / 'app'
            if route:
                return base / route / 'page.tsx'
            return base / 'page.tsx'

        elif self.framework == Framework.NEXTJS_PAGES_ROUTER:
            # /dashboard2/create -> src/pages/dashboard2/create.tsx or index.tsx
            base = self.project_root / 'src' / 'pages'
            if not base.exists():
                base = self.project_root / 'pages'
            if route:
                # Try direct file first
                direct = base / f"{route}.tsx"
                if direct.exists():
                    return direct
                # Try index file
                return base / route / 'index.tsx'
            return base / 'index.tsx'

        # For other frameworks, return a best guess
        return self.project_root / 'src' / 'pages' / route / 'page.tsx'

    def _extract_imports(self, file_path: Path) -> list[str]:
        """Extract component imports from a file."""
        if not file_path.exists():
            return []

        content = file_path.read_text()
        imports = []

        # Match import statements for components
        # import { Component } from '@/components/...'
        # import Component from '@/components/...'
        patterns = [
            r"import\s+\{[^}]+\}\s+from\s+['\"](@/components/[^'\"]+)['\"]",
            r"import\s+\w+\s+from\s+['\"](@/components/[^'\"]+)['\"]",
            r"import\s+\{[^}]+\}\s+from\s+['\"](\.\./components/[^'\"]+)['\"]",
            r"import\s+\{[^}]+\}\s+from\s+['\"](\.\.\/\.\.\/components/[^'\"]+)['\"]",
        ]

        for pattern in patterns:
            matches = re.findall(pattern, content)
            imports.extend(matches)

        return imports

    def _extract_rendered_components(self, file_path: Path) -> list[str]:
        """Extract component names that are rendered in JSX."""
        if not file_path.exists():
            return []

        content = file_path.read_text()

        # Match JSX component usage: <ComponentName or <ComponentName>
        pattern = r'<([A-Z][a-zA-Z0-9]+)'
        matches = re.findall(pattern, content)

        # Deduplicate while preserving order
        seen = set()
        unique = []
        for m in matches:
            if m not in seen:
                seen.add(m)
                unique.append(m)

        return unique

    def _resolve_component_directory(self, import_path: str) -> Optional[str]:
        """Resolve an import path to a component directory."""
        # @/components/ItemCreationWorkflow -> src/components/ItemCreationWorkflow
        if import_path.startswith('@/'):
            relative = import_path[2:]  # Remove @/
            full_path = self.project_root / 'src' / relative

            # Check if it's a directory with index
            if full_path.is_dir():
                return str(full_path)

            # Check if it's a file
            for ext in ['.tsx', '.ts', '.jsx', '.js']:
                if (full_path.parent / f"{full_path.name}{ext}").exists():
                    return str(full_path.parent)

            # Return the directory anyway (component might be there)
            if '/' in relative:
                return str(self.project_root / 'src' / relative.rsplit('/', 1)[0])

        return None

    def _generate_verification_hints(self, trace: ComponentTrace, page_content: str) -> list[str]:
        """Generate hints for Agent 00 to verify the component is correct."""
        hints = []

        if trace.primary_component:
            hints.append(f"Read {trace.page_file} to confirm it renders <{trace.primary_component}>")

        if trace.component_directory:
            hints.append(f"Check {trace.component_directory}/ for step/progress related code")
            hints.append(f"Look for constants.ts, types.ts, or state hooks in the component directory")

        # Add framework-specific hints
        if self.framework == Framework.NEXTJS_APP_ROUTER:
            hints.append("This is Next.js App Router - check for 'use client' directive")

        # Check for step-related patterns in page
        if re.search(r'step|progress|wizard|workflow', page_content, re.IGNORECASE):
            hints.append("Page file contains step/workflow references - verify these match PRD")

        return hints

    def trace_route(self, route: str) -> ComponentTrace:
        """Trace a single route to its rendering component."""
        page_file = self._route_to_page_file(route)
        page_exists = page_file.exists()

        if not page_exists:
            # Try parent route
            parent_route = '/'.join(route.strip('/').split('/')[:-1])
            if parent_route:
                page_file = self._route_to_page_file(parent_route)
                page_exists = page_file.exists()

        if not page_exists:
            return ComponentTrace(
                route=route,
                page_file=str(page_file),
                page_file_exists=False,
                primary_component=None,
                component_directory=None,
                all_imports=[],
                framework=self.framework.value,
                verification_hints=[],
                error=f"Page file not found: {page_file}"
            )

        # Extract imports and rendered components
        imports = self._extract_imports(page_file)
        rendered = self._extract_rendered_components(page_file)
        page_content = page_file.read_text()

        # Determine primary component (first rendered component that's imported from components/)
        primary_component = None
        component_directory = None

        for imp in imports:
            comp_dir = self._resolve_component_directory(imp)
            if comp_dir:
                # Extract component name from import path
                comp_name = imp.split('/')[-1]
                if comp_name in rendered or any(comp_name in r for r in rendered):
                    primary_component = comp_name
                    component_directory = comp_dir
                    break

        # If no match, use first component import
        if not primary_component and imports:
            primary_component = imports[0].split('/')[-1]
            component_directory = self._resolve_component_directory(imports[0])

        trace = ComponentTrace(
            route=route,
            page_file=str(page_file),
            page_file_exists=True,
            primary_component=primary_component,
            component_directory=component_directory,
            all_imports=imports,
            framework=self.framework.value,
            verification_hints=[]
        )

        trace.verification_hints = self._generate_verification_hints(trace, page_content)

        return trace

    def trace_routes(self, routes: list[str]) -> RouteTraceResult:
        """Trace multiple routes and return consolidated results."""
        traces = [self.trace_route(route) for route in routes]

        # Generate summary
        summary = {
            'total_routes': len(routes),
            'routes_found': sum(1 for t in traces if t.page_file_exists),
            'components_identified': sum(1 for t in traces if t.primary_component),
            'unique_components': list(set(t.primary_component for t in traces if t.primary_component)),
            'unique_directories': list(set(t.component_directory for t in traces if t.component_directory)),
        }

        return RouteTraceResult(
            prd_path='',  # Set by caller
            project_root=str(self.project_root),
            framework_detected=self.framework.value,
            routes_found=routes,
            traces=traces,
            summary=summary
        )

    def extract_routes_from_prd(self, prd_content: str) -> list[str]:
        """Extract route references from PRD content."""
        routes = set()

        # Match route patterns
        patterns = [
            r'Route:\s*([/\w-]+)',           # Route: /dashboard2/create
            r'route["\']?\s*[=:]\s*["\']?([/\w-]+)',  # route: "/dashboard2"
            r'(/dashboard\d*/[\w-]*)',        # /dashboard2/anything
            r'(/[\w-]+/[\w-]+)',              # /any/path
        ]

        for pattern in patterns:
            matches = re.findall(pattern, prd_content, re.IGNORECASE)
            for match in matches:
                # Clean up the route
                route = match.strip().strip('"\'')
                if route.startswith('/') and len(route) > 1:
                    routes.add(route)

        # Infer sub-routes based on PRD content keywords
        inferred_routes = self._infer_sub_routes(prd_content, routes)
        routes.update(inferred_routes)

        return list(routes)

    def _infer_sub_routes(self, prd_content: str, existing_routes: set) -> set:
        """
        Infer additional sub-routes based on PRD content.

        If PRD mentions "workflow", "wizard", "step count", "create item", etc.
        and only has a parent route like /dashboard2/, infer /dashboard2/create.
        """
        inferred = set()
        content_lower = prd_content.lower()

        # Keywords that suggest item creation workflow
        creation_keywords = [
            'step count', 'step x of', 'workflow', 'wizard',
            'create item', 'item creation', 'save item', 'item saved',
            'what\'s next', 'whats next', 'post-save', 'post-workflow'
        ]

        # Keywords that suggest list/management pages
        list_keywords = [
            'items list', 'list of items', 'rooms list', 'tags list'
        ]

        has_creation_keywords = any(kw in content_lower for kw in creation_keywords)
        has_list_keywords = any(kw in content_lower for kw in list_keywords)

        for route in existing_routes:
            # If we have a dashboard route and creation keywords, infer /create
            if 'dashboard' in route and has_creation_keywords:
                base = route.rstrip('/')
                create_route = f"{base}/create"
                if create_route not in existing_routes:
                    inferred.add(create_route)

            # If we have a dashboard route and list keywords, infer /items, /rooms, etc.
            if 'dashboard' in route and has_list_keywords:
                base = route.rstrip('/')
                if 'items list' in content_lower or 'list of items' in content_lower:
                    inferred.add(f"{base}/items")
                if 'rooms list' in content_lower:
                    inferred.add(f"{base}/rooms")
                if 'tags list' in content_lower:
                    inferred.add(f"{base}/tags")

        return inferred


def trace_prd_routes(prd_path: Path, project_root: Path) -> RouteTraceResult:
    """
    Main entry point: Extract routes from PRD and trace to components.

    Args:
        prd_path: Path to the PRD markdown file
        project_root: Path to the project root directory

    Returns:
        RouteTraceResult with all traced routes and components
    """
    tracer = RouteTracer(project_root)

    # Read PRD and extract routes
    prd_content = prd_path.read_text()
    routes = tracer.extract_routes_from_prd(prd_content)

    # Trace all routes
    result = tracer.trace_routes(routes)
    result.prd_path = str(prd_path)

    return result


def save_trace_result(result: RouteTraceResult, output_path: Path):
    """Save trace result to JSON file."""
    # Convert dataclasses to dicts
    data = {
        'prd_path': result.prd_path,
        'project_root': result.project_root,
        'framework_detected': result.framework_detected,
        'routes_found': result.routes_found,
        'traces': [asdict(t) for t in result.traces],
        'summary': result.summary
    }

    output_path.write_text(json.dumps(data, indent=2))


# CLI interface
if __name__ == '__main__':
    import sys

    if len(sys.argv) < 3:
        print("Usage: python route_tracer.py <prd_path> <project_root> [output_path]")
        sys.exit(1)

    prd_path = Path(sys.argv[1])
    project_root = Path(sys.argv[2])
    output_path = Path(sys.argv[3]) if len(sys.argv) > 3 else Path('route_trace.json')

    result = trace_prd_routes(prd_path, project_root)
    save_trace_result(result, output_path)

    print(f"Route trace complete:")
    print(f"  Framework: {result.framework_detected}")
    print(f"  Routes found: {len(result.routes_found)}")
    print(f"  Components identified: {result.summary['components_identified']}")
    print(f"  Output: {output_path}")

    for trace in result.traces:
        status = "✓" if trace.page_file_exists else "✗"
        comp = trace.primary_component or "UNKNOWN"
        print(f"  {status} {trace.route} → {comp}")
