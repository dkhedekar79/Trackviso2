import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // This endpoint should only work if no admins exist yet
  // For security, you might want to add an auth token or restrict this to specific IPs

  try {
    // Check if any admins exist
    const { data: existingAdmins, error: checkError } = await supabase
      .from('admin_users')
      .select('id')
      .limit(1);

    if (checkError) {
      return res.status(400).json({ error: checkError.message });
    }

    if (existingAdmins && existingAdmins.length > 0) {
      return res.status(400).json({ error: 'Admin already exists. Use /api/admin/users to manage admins.' });
    }

    // Find user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      return res.status(400).json({ error: listError.message });
    }

    const adminUser = users.users.find(u => u.email === 'dskhedekar7@gmail.com');

    if (!adminUser) {
      return res.status(404).json({ error: 'User dskhedekar7@gmail.com not found. Please sign up first.' });
    }

    // Create admin record
    const { error: insertError } = await supabase
      .from('admin_users')
      .insert([{
        user_id: adminUser.id,
        email: adminUser.email,
        role: 'admin',
        permissions: {
          manage_users: true,
          manage_subscriptions: true,
          view_analytics: true
        }
      }]);

    if (insertError) {
      return res.status(400).json({ error: insertError.message });
    }

    // Also make sure user_stats exists and is_premium is true
    await supabase
      .from('user_stats')
      .upsert({
        user_id: adminUser.id,
        is_premium: true,
        xp_multiplier: 2.0
      }, { onConflict: 'user_id' });

    // Update auth metadata
    await supabase.auth.admin.updateUserById(adminUser.id, {
      user_metadata: {
        subscription_plan: 'professor',
        is_premium: true,
        is_admin: true
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Admin initialized successfully',
      admin: {
        email: adminUser.email,
        userId: adminUser.id
      }
    });
  } catch (error) {
    console.error('Initialize admin error:', error);
    return res.status(500).json({ error: error.message });
  }
}
