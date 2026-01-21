/**
 * Resource Monitor for Performance Tests
 *
 * Tracks memory usage, detects leaks, and monitors concurrent jobs.
 *
 * @module job-queue/__tests__/performance/helpers/resource-monitor
 * @lastModified 2026-01-21
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface ResourceSnapshot {
  timestamp: number;
  heapUsedMb: number;
  heapTotalMb: number;
  externalMb: number;
  activeJobCount: number;
  pendingJobCount: number;
  rateLimitQueueSize: number;
}

export interface MemoryLeakAnalysis {
  detected: boolean;
  trend: number; // positive = growing, negative = shrinking
  confidence: 'low' | 'medium' | 'high';
  snapshots: number;
  startMb: number;
  endMb: number;
  growthMb: number;
  growthPercent: number;
}

export interface PeakMetrics {
  peakMemory: number;
  peakConcurrency: number;
  peakPendingJobs: number;
  peakRateLimitQueue: number;
}

// ============================================================================
// Resource Monitor Class
// ============================================================================

export class ResourceMonitor {
  private snapshots: ResourceSnapshot[];
  private intervalId: ReturnType<typeof setInterval> | null;
  private isMonitoring: boolean;

  constructor() {
    this.snapshots = [];
    this.intervalId = null;
    this.isMonitoring = false;
  }

  /**
   * Start periodic monitoring at specified interval.
   */
  startMonitoring(intervalMs: number): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.intervalId = setInterval(() => {
      this.captureSnapshot(0, 0, 0);
    }, intervalMs);
  }

  /**
   * Stop periodic monitoring.
   */
  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isMonitoring = false;
  }

  /**
   * Capture a single resource snapshot.
   */
  captureSnapshot(
    activeJobs: number,
    pendingJobs: number,
    queueSize: number
  ): ResourceSnapshot {
    const memUsage = process.memoryUsage();
    const snapshot: ResourceSnapshot = {
      timestamp: performance.now(),
      heapUsedMb: memUsage.heapUsed / 1024 / 1024,
      heapTotalMb: memUsage.heapTotal / 1024 / 1024,
      externalMb: memUsage.external / 1024 / 1024,
      activeJobCount: activeJobs,
      pendingJobCount: pendingJobs,
      rateLimitQueueSize: queueSize,
    };

    this.snapshots.push(snapshot);
    return snapshot;
  }

  /**
   * Get all captured snapshots.
   */
  getSnapshots(): ResourceSnapshot[] {
    return [...this.snapshots];
  }

  /**
   * Analyze snapshots for memory leak patterns.
   * Uses linear regression to detect upward trend.
   */
  detectMemoryLeak(): MemoryLeakAnalysis {
    if (this.snapshots.length < 5) {
      return {
        detected: false,
        trend: 0,
        confidence: 'low',
        snapshots: this.snapshots.length,
        startMb: this.snapshots[0]?.heapUsedMb || 0,
        endMb: this.snapshots[this.snapshots.length - 1]?.heapUsedMb || 0,
        growthMb: 0,
        growthPercent: 0,
      };
    }

    const memoryValues = this.snapshots.map(s => s.heapUsedMb);
    const n = memoryValues.length;

    // Calculate linear regression slope
    const sumX = (n * (n - 1)) / 2;
    const sumY = memoryValues.reduce((a, b) => a + b, 0);
    const sumXY = memoryValues.reduce((sum, y, x) => sum + x * y, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    const startMb = memoryValues[0];
    const endMb = memoryValues[memoryValues.length - 1];
    const growthMb = endMb - startMb;
    const growthPercent = startMb > 0 ? (growthMb / startMb) * 100 : 0;

    // Determine confidence based on sample size and consistency
    let confidence: MemoryLeakAnalysis['confidence'] = 'low';
    if (n >= 20) confidence = 'high';
    else if (n >= 10) confidence = 'medium';

    // Leak detected if: positive slope AND significant growth (>10% or >10MB)
    const detected = slope > 0.1 && (growthPercent > 10 || growthMb > 10);

    return {
      detected,
      trend: slope,
      confidence,
      snapshots: n,
      startMb,
      endMb,
      growthMb,
      growthPercent,
    };
  }

  /**
   * Get peak values from all snapshots.
   */
  getPeakMetrics(): PeakMetrics {
    if (this.snapshots.length === 0) {
      return {
        peakMemory: 0,
        peakConcurrency: 0,
        peakPendingJobs: 0,
        peakRateLimitQueue: 0,
      };
    }

    return {
      peakMemory: Math.max(...this.snapshots.map(s => s.heapUsedMb)),
      peakConcurrency: Math.max(...this.snapshots.map(s => s.activeJobCount)),
      peakPendingJobs: Math.max(...this.snapshots.map(s => s.pendingJobCount)),
      peakRateLimitQueue: Math.max(...this.snapshots.map(s => s.rateLimitQueueSize)),
    };
  }

  /**
   * Clear all captured snapshots.
   */
  clear(): void {
    this.snapshots = [];
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createResourceMonitor(): ResourceMonitor {
  return new ResourceMonitor();
}
