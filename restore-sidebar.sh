#!/bin/bash
cd "$(dirname "$0")"

PAGES=(
  "src/app/services/page.tsx"
  "src/app/dashboard/page.tsx"
  "src/app/clients/page.tsx"
  "src/app/orders/page.tsx"
  "src/app/kanban/page.tsx"
  "src/app/contracts/page.tsx"
  "src/app/invoices/page.tsx"
  "src/app/analytics/page.tsx"
  "src/app/notifications/page.tsx"
  "src/app/settings/page.tsx"
)

for page in "${PAGES[@]}"; do
  if [ ! -f "$page" ]; then
    echo "SKIP (missing): $page"
    continue
  fi

  # 1. TopNav import → Sidebar import
  sed -i '' "s|import TopNav from '@/components/TopNav'|import Sidebar from '@/components/Sidebar'|g" "$page"

  # 2. <TopNav /> → <Sidebar />
  sed -i '' 's|<TopNav />|<Sidebar />|g' "$page"

  # 3. Layout: standalone → flex with sidebar
  sed -i '' 's|className="min-h-screen bg-\[#F5F6FA\]"|className="flex min-h-screen bg-[#F5F6FA]"|g' "$page"

  # 4. Content wrapper: max-w → flex-1
  sed -i '' 's|className="max-w-7xl mx-auto p-4 md:p-8"|className="flex-1 p-8 overflow-auto"|g' "$page"

  echo "OK: $page"
done

echo "Done — all pages restored to sidebar layout."
