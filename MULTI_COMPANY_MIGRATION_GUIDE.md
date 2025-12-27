# Multi-Company System Migration Guide

## Overview
The system now supports multiple companies (multi-tenant). Each company's data is completely isolated.

**Current Companies:**
1. **Amigos La Kokido AS** - Existing company (all current data belongs to this company)
2. **Actic FLAVORS AS** - New company (empty, ready for new data)

## Database Changes

### All tables now have `company_id` column
- Every HACCP table has `company_id`
- Every HMS table has `company_id`
- All existing data has been assigned to "Amigos La Kokido AS"

### Company Switching
- Users can switch between companies using the CompanySwitcher in the header
- Selected company is saved in localStorage
- All queries automatically filter by the selected company

## How to Update Components

### 1. Import the Company Hook
```tsx
import { useCompany } from '../../contexts/CompanyContext';
```

### 2. Get the Current Company
```tsx
const { currentCompany } = useCompany();
```

### 3. Update All Database Queries

#### Before (Old Way):
```tsx
const { data, error } = await hmsSupabase
  .from('temperature_logs')
  .select('*')
  .order('created_at', { ascending: false });
```

#### After (New Way - Method 1: Manual):
```tsx
const { data, error } = await hmsSupabase
  .from('temperature_logs')
  .select('*')
  .eq('company_id', currentCompany.id)
  .order('created_at', { ascending: false });
```

#### After (New Way - Method 2: Using Helper):
```tsx
import { createCompanyQuery } from '../../lib/companyQueries';

const companyQuery = createCompanyQuery(currentCompany.id);
const { data, error } = await companyQuery
  .select('temperature_logs')
  .order('created_at', { ascending: false });
```

### 4. Update INSERT Queries

#### Before:
```tsx
const { error } = await hmsSupabase
  .from('temperature_logs')
  .insert({
    zone_id: zoneId,
    temperature: temp,
    recorded_by: employeeId
  });
```

#### After (Method 1):
```tsx
const { error } = await hmsSupabase
  .from('temperature_logs')
  .insert({
    zone_id: zoneId,
    temperature: temp,
    recorded_by: employeeId,
    company_id: currentCompany.id  // Add this line
  });
```

#### After (Method 2):
```tsx
import { createCompanyQuery } from '../../lib/companyQueries';

const companyQuery = createCompanyQuery(currentCompany.id);
const { error } = await companyQuery.insert('temperature_logs', {
  zone_id: zoneId,
  temperature: temp,
  recorded_by: employeeId
});
```

### 5. Update UPDATE Queries

#### Before:
```tsx
const { error } = await hmsSupabase
  .from('temperature_logs')
  .update({ temperature: newTemp })
  .eq('id', logId);
```

#### After:
```tsx
const { error } = await hmsSupabase
  .from('temperature_logs')
  .update({ temperature: newTemp })
  .eq('id', logId)
  .eq('company_id', currentCompany.id);  // Add this line for security
```

### 6. Update DELETE Queries

#### Before:
```tsx
const { error } = await hmsSupabase
  .from('temperature_logs')
  .delete()
  .eq('id', logId);
```

#### After:
```tsx
const { error } = await hmsSupabase
  .from('temperature_logs')
  .delete()
  .eq('id', logId)
  .eq('company_id', currentCompany.id);  // Add this line for security
```

## Important Notes

### Loading States
Always check if company is loaded before making queries:
```tsx
const { currentCompany, loading } = useCompany();

if (loading || !currentCompany) {
  return <div>Loading...</div>;
}
```

### Data Isolation
- Each company ONLY sees its own data
- Switching companies immediately shows different data
- No cross-company data leakage

### Foreign Keys
When inserting data with foreign keys (e.g., employee_id, zone_id):
- Make sure the referenced record belongs to the same company
- Use dropdowns/selects that are already filtered by company_id

## Testing Checklist

When updating a component:
- [ ] Add `useCompany()` hook
- [ ] Add `company_id` to all SELECT queries with `.eq('company_id', currentCompany.id)`
- [ ] Add `company_id` to all INSERT queries
- [ ] Add `company_id` filter to all UPDATE queries
- [ ] Add `company_id` filter to all DELETE queries
- [ ] Test switching companies - verify data changes
- [ ] Test inserting new data - verify it belongs to correct company
- [ ] Check loading state handling

## Example: Complete Component Update

```tsx
import { useState, useEffect } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { hmsSupabase } from '../../lib/hmsSupabase';

export default function TemperatureLog() {
  const { currentCompany, loading: companyLoading } = useCompany();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentCompany) {
      loadLogs();
    }
  }, [currentCompany]); // Reload when company changes

  async function loadLogs() {
    if (!currentCompany) return;

    setLoading(true);
    try {
      const { data, error } = await hmsSupabase
        .from('temperature_logs')
        .select('*')
        .eq('company_id', currentCompany.id) // Filter by company
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addLog(temperature: number) {
    if (!currentCompany) return;

    const { error } = await hmsSupabase
      .from('temperature_logs')
      .insert({
        temperature,
        company_id: currentCompany.id, // Include company_id
        recorded_by: 'user'
      });

    if (!error) {
      loadLogs();
    }
  }

  if (companyLoading || !currentCompany) {
    return <div>Loading company...</div>;
  }

  return (
    <div>
      <h2>{currentCompany.name} - Temperature Logs</h2>
      {/* Rest of component */}
    </div>
  );
}
```

## Priority Update List

Update these components first (high priority):
1. All components in `src/components/HACCP/`
2. All components in `src/components/HMS/`
3. All API calls in `src/lib/`

## Support

If you encounter issues:
1. Check that `company_id` is added to ALL queries
2. Verify `currentCompany` is not null before queries
3. Check browser console for errors
4. Test with both companies to ensure isolation
