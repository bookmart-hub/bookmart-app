$dirs = @(
  "src/assets/images",
  "src/assets/fonts",
  "src/assets/lottie",
  "src/components/ui",
  "src/components/form",
  "src/components/feedback",
  "src/features/auth/api",
  "src/features/auth/components",
  "src/features/auth/screens",
  "src/features/auth/types",
  "src/features/books",
  "src/features/profile",
  "src/features/cart",
  "src/navigation",
  "src/services/api",
  "src/services/storage",
  "src/services/analytics",
  "src/store/slices",
  "src/hooks",
  "src/theme",
  "src/utils",
  "src/constants",
  "src/types",
  "src/config"
)

foreach ($dir in $dirs) {
  New-Item -ItemType Directory -Force -Path $dir
}

# Create .env files
New-Item -ItemType File -Force -Path ".env.development"
New-Item -ItemType File -Force -Path ".env.production"
