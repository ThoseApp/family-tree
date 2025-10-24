# Mock Data Test Environment - Quick Start

## 🚀 Enable Mock Mode

1. **Create `.env.local` file** (if it doesn't exist):

   ```bash
   NEXT_PUBLIC_USE_MOCK_DATA=true
   ```

2. **Start the development server**:

   ```bash
   npm run dev
   ```

3. **Look for the orange banner** at the top of the page - this confirms mock mode is active!

## 🔐 Test Accounts

**Universal Password**: `Demo@123.` (works for all accounts!)

| Email                | Password    | Role      |
| -------------------- | ----------- | --------- |
| `admin@test.com`     | `Demo@123.` | Admin     |
| `publisher@test.com` | `Demo@123.` | Publisher |
| `user@test.com`      | `Demo@123.` | User      |
| `pending@test.com`   | `Demo@123.` | Pending   |
| `rejected@test.com`  | `Demo@123.` | Rejected  |

> 💡 **Tip**: You can use either the "Switch User" button in the mock banner or login manually with any email + `Demo@123.`

## 🎯 What's Included

- ✅ **12 Family Members** with realistic relationships
- ✅ **6 Events** with various statuses
- ✅ **6 Notice Board Posts**
- ✅ **8 Gallery Photos** across 6 albums
- ✅ **11 History Timeline Entries**
- ✅ **7 Notifications**
- ✅ **5 Event Invitations**
- ✅ **3 Family Member Requests**

## 🛠️ Developer Tools

The orange banner at the top provides:

- **Switch User**: Quickly change between test accounts
- **Reset Data**: Restore all data to original fixtures
- **Export**: Download current data state as JSON
- **Close**: Hide banner (doesn't disable mock mode)

## 📝 Important Notes

- ⚠️ **Data resets on page reload** - this is by design for clean demos
- ⚠️ **Never use in production** - mock mode has no security
- ✅ **No internet required** - fully offline development
- ✅ **No database costs** - perfect for staging

## 🔗 Full Documentation

See [docs/mock-data-setup.md](./docs/mock-data-setup.md) for:

- Complete architecture details
- How to modify fixtures
- Troubleshooting guide
- Best practices
- API reference

## ✨ Example Use Cases

### For Client Demos

1. Click "Reset Data" before demo
2. Sign in as `admin@test.com`
3. Showcase all features without risk
4. Data automatically resets on refresh

### For Development

1. Test features offline
2. Consistent data for debugging
3. Fast iteration without network delays
4. Switch users instantly

### For Testing

1. Reproducible test scenarios
2. Known data state
3. No test data pollution
4. Easy cleanup with reset

## 🚫 Disable Mock Mode

Remove or change in `.env.local`:

```bash
NEXT_PUBLIC_USE_MOCK_DATA=false
```

Then restart the dev server.

---

**Questions?** Check the [full documentation](./docs/mock-data-setup.md) or inspect the fixtures in `lib/mock-data/fixtures/`
