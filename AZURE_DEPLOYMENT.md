# Azure Deployment Guide

## Prerequisites
1. Azure account with Static Web Apps enabled
2. GitHub repository with your code
3. Supabase project set up

## Deployment Steps

### 1. Create Azure Static Web App
1. Go to Azure Portal (portal.azure.com)
2. Create a new resource → Static Web Apps
3. Connect to your GitHub repository
4. Set build configuration:
   - App location: `/`
   - Api location: `` (empty)
   - Output location: `out`

### 2. Configure Environment Variables
In Azure Portal → Your Static Web App → Configuration, add:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `NEXT_PUBLIC_SITE_URL`: Your Azure Static Web App URL

### 3. GitHub Secrets
Add these secrets to your GitHub repository (Settings → Secrets):
- `AZURE_STATIC_WEB_APPS_API_TOKEN`: From Azure Static Web App deployment token
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `NEXT_PUBLIC_SITE_URL`: Your Azure Static Web App URL

### 4. Deploy
Push to main branch to trigger automatic deployment via GitHub Actions.

## Important Notes
- This app uses static export mode for Azure compatibility
- Server-side features are limited in static export mode
- Database operations work through Supabase client-side SDK
- Authentication flows are handled client-side

## Troubleshooting
- Check GitHub Actions logs for build errors
- Verify environment variables are set correctly
- Ensure Supabase RLS policies allow client-side access
