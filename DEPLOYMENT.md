# Deployment Guide

This guide covers deploying the QR Item Display System to various platforms.

## Prerequisites

Before deploying, ensure you have:

1. ✅ **Supabase Project**: Set up with schema and sample data
2. ✅ **Environment Variables**: All required variables configured
3. ✅ **Local Testing**: Application tested and working locally
4. ✅ **Build Success**: `npm run build` completes without errors

## Platform-Specific Deployment

### 🚀 Vercel (Recommended)

Vercel provides the best experience for Next.js applications.

#### Method 1: GitHub Integration

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

3. **Environment Variables in Vercel**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXTAUTH_SECRET=your_random_secret_key
   NEXTAUTH_URL=https://your-app.vercel.app
   ```

#### Method 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login and Deploy**
   ```bash
   vercel login
   vercel --prod
   ```

3. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXTAUTH_URL
   ```

### 🌐 Netlify

1. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

2. **Environment Variables**
   Add all required environment variables in Netlify dashboard

3. **Deploy**
   - Connect GitHub repository
   - Configure build settings
   - Deploy

### 🚂 Railway

1. **Create New Project**
   - Connect GitHub repository
   - Railway auto-detects Next.js

2. **Environment Variables**
   Add in Railway dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   NEXTAUTH_SECRET
   NEXTAUTH_URL
   ```

3. **Deploy**
   - Railway automatically builds and deploys
   - Custom domain available

### 🌊 DigitalOcean App Platform

1. **Create App**
   - Connect GitHub repository
   - Select Node.js environment

2. **Build Configuration**
   ```yaml
   name: qr-item-system
   services:
   - name: web
     source_dir: /
     github:
       repo: your-username/qr-item-system
       branch: main
     run_command: npm start
     build_command: npm run build
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: NEXT_PUBLIC_SUPABASE_URL
       value: your_value
     - key: NEXT_PUBLIC_SUPABASE_ANON_KEY
       value: your_value
     # ... other env vars
   ```

### 🐳 Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS base
   
   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   
   COPY package.json package-lock.json* ./
   RUN npm ci
   
   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   
   RUN npm run build
   
   # Production image, copy all the files and run next
   FROM base AS runner
   WORKDIR /app
   
   ENV NODE_ENV production
   
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   
   USER nextjs
   
   EXPOSE 3000
   
   ENV PORT 3000
   
   CMD ["node", "server.js"]
   ```

2. **Build and Run**
   ```bash
   docker build -t qr-item-system .
   docker run -p 3000:3000 --env-file .env.local qr-item-system
   ```

## Post-Deployment Checklist

### ✅ Verification Steps

1. **Homepage Loading**
   - Visit your deployed URL
   - Verify all sections load correctly
   - Test sample item links

2. **Admin Panel Access**
   - Go to `/admin`
   - Verify error handling (if no database)
   - Test form interfaces

3. **API Endpoints**
   - Test `/api/items/12345` (should show error without DB)
   - Verify proper error responses

4. **Mobile Responsiveness**
   - Test on various device sizes
   - Verify touch interactions work

### 🔧 Configuration Updates

1. **Update NEXTAUTH_URL**
   ```env
   NEXTAUTH_URL=https://your-deployed-domain.com
   ```

2. **CORS Settings**
   - Update Supabase CORS settings if needed
   - Add your domain to allowed origins

3. **Database Connection**
   - Verify Supabase connection from deployed app
   - Test API endpoints with real data

### 🚨 Troubleshooting

#### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

#### Environment Variable Issues

1. **Check Variable Names**
   - Ensure exact spelling
   - Verify NEXT_PUBLIC_ prefix for client-side vars

2. **Restart Deployment**
   - After adding env vars, redeploy
   - Some platforms require manual restart

#### Database Connection Issues

1. **Verify Supabase Settings**
   - Check project URL and keys
   - Verify RLS policies are correct

2. **Network Issues**
   - Ensure deployment platform can reach Supabase
   - Check firewall settings

## Performance Optimization

### 🚀 Production Optimizations

1. **Enable Compression**
   ```javascript
   // next.config.js
   module.exports = {
     compress: true,
     // ... other config
   }
   ```

2. **Image Optimization**
   - Use Next.js Image component
   - Configure image domains in next.config.js

3. **Caching Strategy**
   - Configure appropriate cache headers
   - Use ISR for static content

### 📊 Monitoring

1. **Error Tracking**
   - Integrate Sentry or similar
   - Monitor API endpoint errors

2. **Performance Monitoring**
   - Use Vercel Analytics
   - Monitor Core Web Vitals

3. **Database Monitoring**
   - Monitor Supabase usage
   - Set up alerts for high usage

## Security Considerations

### 🔒 Production Security

1. **Environment Variables**
   - Never commit .env files
   - Use platform-specific secret management

2. **API Security**
   - Implement rate limiting
   - Validate all inputs

3. **Database Security**
   - Review RLS policies
   - Monitor access logs

### 🛡️ Best Practices

1. **HTTPS Only**
   - Ensure all traffic uses HTTPS
   - Configure proper redirects

2. **Content Security Policy**
   - Implement CSP headers
   - Restrict external resources

3. **Regular Updates**
   - Keep dependencies updated
   - Monitor security advisories

## Scaling Considerations

### 📈 Traffic Growth

1. **CDN Configuration**
   - Use Vercel Edge Network
   - Configure proper caching

2. **Database Scaling**
   - Monitor Supabase usage
   - Consider connection pooling

3. **API Rate Limiting**
   - Implement rate limiting
   - Consider API caching

---

## Support

If you encounter issues during deployment:

1. Check the troubleshooting section above
2. Review platform-specific documentation
3. Create an issue with deployment logs
4. Join our community discussions

**Happy Deploying! 🚀**

