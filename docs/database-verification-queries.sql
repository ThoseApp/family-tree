-- ===================================================================
-- DATABASE VERIFICATION QUERIES
-- ===================================================================
-- Run these queries after setting up your database to verify everything is working
-- ===================================================================

-- ===================================================================
-- 1. VERIFY ALL REQUIRED TABLES EXIST
-- ===================================================================
SELECT 
    'TABLES CHECK' as check_type,
    table_name,
    CASE 
        WHEN table_name IN (
            'profiles', 'family-tree', 'events', 'galleries', 'notice_boards',
            'life_events', 'history', 'family_member_requests', 'albums',
            'event_invitations', 'notifications'
        ) THEN '✅ REQUIRED'
        ELSE '⚠️  ADDITIONAL'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY 
    CASE 
        WHEN table_name IN (
            'profiles', 'family-tree', 'events', 'galleries', 'notice_boards',
            'life_events', 'history', 'family_member_requests', 'albums',
            'event_invitations', 'notifications'
        ) THEN 1
        ELSE 2
    END,
    table_name;

-- ===================================================================
-- 2. VERIFY ALL REQUIRED FUNCTIONS EXIST
-- ===================================================================
SELECT 
    'FUNCTIONS CHECK' as check_type,
    routine_name,
    routine_type,
    CASE 
        WHEN routine_name IN (
            'create_system_notification', 'create_system_notifications',
            'create_admin_notifications', 'get_admin_user_ids',
            'set_updated_at', 'populate_family_tree_uids',
            'link_profiles_to_family_tree'
        ) THEN '✅ REQUIRED'
        ELSE '⚠️  ADDITIONAL'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
ORDER BY 
    CASE 
        WHEN routine_name IN (
            'create_system_notification', 'create_system_notifications',
            'create_admin_notifications', 'get_admin_user_ids',
            'set_updated_at', 'populate_family_tree_uids',
            'link_profiles_to_family_tree'
        ) THEN 1
        ELSE 2
    END,
    routine_name;

-- ===================================================================
-- 3. VERIFY ROW LEVEL SECURITY IS ENABLED
-- ===================================================================
SELECT 
    'RLS CHECK' as check_type,
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ===================================================================
-- 4. VERIFY INDEXES EXIST
-- ===================================================================
SELECT 
    'INDEXES CHECK' as check_type,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ===================================================================
-- 5. VERIFY FOREIGN KEY CONSTRAINTS
-- ===================================================================
SELECT 
    'FOREIGN KEYS CHECK' as check_type,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- ===================================================================
-- 6. VERIFY TRIGGERS EXIST
-- ===================================================================
SELECT 
    'TRIGGERS CHECK' as check_type,
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ===================================================================
-- 7. VERIFY COLUMN CONSTRAINTS (CHECK CONSTRAINTS)
-- ===================================================================
SELECT 
    'CHECK CONSTRAINTS' as check_type,
    tc.table_name,
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
    AND tc.constraint_type = 'CHECK'
ORDER BY tc.table_name, tc.constraint_name;

-- ===================================================================
-- 8. VERIFY UNIQUE CONSTRAINTS
-- ===================================================================
SELECT 
    'UNIQUE CONSTRAINTS' as check_type,
    tc.table_name,
    tc.constraint_name,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'UNIQUE'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- ===================================================================
-- 9. CHECK COLUMN DATA TYPES AND DEFAULTS
-- ===================================================================
SELECT 
    'COLUMNS CHECK' as check_type,
    table_name,
    column_name,
    data_type,
    column_default,
    is_nullable,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public'
    AND table_name IN (
        'profiles', 'family-tree', 'events', 'galleries', 'notice_boards',
        'life_events', 'history', 'family_member_requests', 'albums',
        'event_invitations', 'notifications'
    )
ORDER BY table_name, ordinal_position;

-- ===================================================================
-- 10. TEST FUNCTIONS (SAFE TO RUN)
-- ===================================================================

-- Test notification function (won't create actual notification without valid user)
SELECT 'NOTIFICATION FUNCTION TEST' as test_type, 'Function exists and is callable' as result
FROM pg_proc 
WHERE proname = 'create_system_notification'
LIMIT 1;

-- Test admin function
SELECT 'ADMIN FUNCTION TEST' as test_type, get_admin_user_ids() as result;

-- ===================================================================
-- 11. SUMMARY REPORT
-- ===================================================================
WITH table_count AS (
    SELECT COUNT(*) as total_tables 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
),
required_tables AS (
    SELECT COUNT(*) as required_count
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name IN (
        'profiles', 'family-tree', 'events', 'galleries', 'notice_boards',
        'life_events', 'history', 'family_member_requests', 'albums',
        'event_invitations', 'notifications'
    )
),
function_count AS (
    SELECT COUNT(*) as total_functions
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_type = 'FUNCTION'
),
rls_count AS (
    SELECT COUNT(*) as rls_enabled_count
    FROM pg_tables 
    WHERE schemaname = 'public'
    AND rowsecurity = true
)
SELECT 
    '=== DATABASE SETUP SUMMARY ===' as summary,
    tc.total_tables as total_tables,
    rt.required_count as required_tables_found,
    CASE WHEN rt.required_count >= 11 THEN '✅ COMPLETE' ELSE '❌ MISSING TABLES' END as table_status,
    fc.total_functions as total_functions,
    CASE WHEN fc.total_functions >= 7 THEN '✅ COMPLETE' ELSE '❌ MISSING FUNCTIONS' END as function_status,
    rc.rls_enabled_count as rls_enabled_tables,
    CASE WHEN rc.rls_enabled_count >= 11 THEN '✅ COMPLETE' ELSE '❌ RLS NOT ENABLED' END as rls_status
FROM table_count tc
CROSS JOIN required_tables rt
CROSS JOIN function_count fc
CROSS JOIN rls_count rc;

-- ===================================================================
-- 12. QUICK FUNCTIONAL TESTS
-- ===================================================================

-- Test that we can query each table (will return empty results in new database)
SELECT 'profiles' as table_name, COUNT(*) as row_count FROM profiles
UNION ALL
SELECT 'family-tree', COUNT(*) FROM "family-tree"
UNION ALL
SELECT 'events', COUNT(*) FROM events
UNION ALL
SELECT 'galleries', COUNT(*) FROM galleries
UNION ALL
SELECT 'notice_boards', COUNT(*) FROM notice_boards
UNION ALL
SELECT 'life_events', COUNT(*) FROM life_events
UNION ALL
SELECT 'history', COUNT(*) FROM history
UNION ALL
SELECT 'family_member_requests', COUNT(*) FROM family_member_requests
UNION ALL
SELECT 'albums', COUNT(*) FROM albums
UNION ALL
SELECT 'event_invitations', COUNT(*) FROM event_invitations
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
ORDER BY table_name;

-- ===================================================================
-- VERIFICATION COMPLETE
-- ===================================================================

SELECT 
    '🎉 VERIFICATION COMPLETE!' as message,
    'If all checks show ✅ status, your database is ready to use!' as instruction;
