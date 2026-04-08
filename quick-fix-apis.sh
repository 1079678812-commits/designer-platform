#!/bin/bash

echo "快速修复API调用..."

# 修复analytics页面
sed -i '' "s|fetch(\`/api/analytics/orders?start=\${startDate}\&end=\${endDate}\`|fetch('/api/data?type=analytics\&start=' + startDate + '\&end=' + endDate|g" public/analytics-simple.html
sed -i '' "s|fetch(\`/api/analytics/clients?start=\${startDate}\&end=\${endDate}\`|fetch('/api/data?type=analytics\&start=' + startDate + '\&end=' + endDate|g" public/analytics-simple.html
sed -i '' "s|fetch(\`/api/analytics/services?start=\${startDate}\&end=\${endDate}\`|fetch('/api/data?type=analytics\&start=' + startDate + '\&end=' + endDate|g" public/analytics-simple.html

# 修复contracts页面
sed -i '' "s|fetch('/api/contracts'|fetch('/api/data?type=contracts'|g" public/contracts-simple.html

# 修复invoices页面
sed -i '' "s|fetch('/api/invoices'|fetch('/api/data?type=invoices'|g" public/invoices-simple.html

# 修复notifications页面
sed -i '' "s|fetch('/api/notifications'|fetch('/api/data?type=notifications'|g" public/notifications-simple.html
sed -i '' "s|fetch(\`/api/notifications/\${notificationId}/read\`|fetch('/api/data', { method: 'POST', body: JSON.stringify({ action: 'mark-notification-read', data: { notificationId } }) })|g" public/notifications-simple.html
sed -i '' "s|fetch('/api/notifications/mark-all-read'|fetch('/api/data', { method: 'POST', body: JSON.stringify({ action: 'mark-all-notifications-read' }) })|g" public/notifications-simple.html
sed -i '' "s|fetch(\`/api/notifications/\${notificationId}\`|fetch('/api/data', { method: 'POST', body: JSON.stringify({ action: 'delete-notification', data: { notificationId } }) })|g" public/notifications-simple.html
sed -i '' "s|fetch('/api/notifications/clear-all'|fetch('/api/data', { method: 'POST', body: JSON.stringify({ action: 'clear-all-notifications' }) })|g" public/notifications-simple.html

# 修复settings页面
sed -i '' "s|fetch('/api/user/profile'|fetch('/api/data?type=profile'|g" public/settings-simple.html
sed -i '' "s|fetch('/api/user/settings'|fetch('/api/data?type=settings'|g" public/settings-simple.html
sed -i '' "s|fetch('/api/user/avatar'|fetch('/api/data', { method: 'POST', body: JSON.stringify({ action: 'update-avatar' }) })|g" public/settings-simple.html
sed -i '' "s|fetch('/api/user/password'|fetch('/api/data', { method: 'POST', body: JSON.stringify({ action: 'update-password' }) })|g" public/settings-simple.html
sed -i '' "s|fetch('/api/user/settings/notifications'|fetch('/api/data', { method: 'POST', body: JSON.stringify({ action: 'update-notification-settings' }) })|g" public/settings-simple.html
sed -i '' "s|fetch('/api/user/settings/privacy'|fetch('/api/data', { method: 'POST', body: JSON.stringify({ action: 'update-privacy-settings' }) })|g" public/settings-simple.html
sed -i '' "s|fetch('/api/user/settings/billing'|fetch('/api/data', { method: 'POST', body: JSON.stringify({ action: 'update-billing-settings' }) })|g" public/settings-simple.html

echo "修复完成！"