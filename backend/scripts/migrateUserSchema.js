// backend/scripts/migrateUserSchema.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Goal = require('../models/Goal');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const migrateUserSchema = async () => {
  try {
    console.log('🔄 Starting user schema migration...');
    
    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users to migrate`);
    
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const user of users) {
      try {
        console.log(`\n👤 Migrating user: ${user.name} (${user.email})`);
        
        // Initialize progress stats if they don't exist
        if (!user.progressStats) {
          user.progressStats = {
            level: 1,
            experience: 0,
            totalGoalsCompleted: 0,
            totalLearningTime: 0,
            longestStreak: 0,
            currentStreak: 0
          };
          console.log('   ✅ Initialized progressStats');
        }
        
        // Initialize activity log if it doesn't exist
        if (!user.activityLog) {
          user.activityLog = [];
          console.log('   ✅ Initialized activityLog');
        }
        
        // Initialize achievements if they don't exist
        if (!user.achievements) {
          user.achievements = [];
          console.log('   ✅ Initialized achievements');
        }
        
        // Initialize daily stats if they don't exist
        if (!user.dailyStats) {
          user.dailyStats = [];
          console.log('   ✅ Initialized dailyStats');
        }
        
        // Initialize preferences if they don't exist
        if (!user.preferences) {
          user.preferences = {
            emailNotifications: true,
            weeklyReports: true,
            achievementNotifications: true
          };
          console.log('   ✅ Initialized preferences');
        }
        
        // Calculate actual completed goals count
        const completedGoals = await Goal.countDocuments({
          user: user._id,
          status: 'completed'
        });
        
        if (user.progressStats.totalGoalsCompleted !== completedGoals) {
          user.progressStats.totalGoalsCompleted = completedGoals;
          console.log(`   📈 Updated totalGoalsCompleted to ${completedGoals}`);
        }
        
        // Award welcome achievement if no achievements exist
        if (user.achievements.length === 0) {
          user.achievements.push({
            id: 'welcome',
            name: 'Welcome to Neural Nexus',
            description: 'Successfully created your account and started your learning journey',
            icon: 'star',
            earnedAt: user.createdAt || new Date(),
            metadata: { migratedAchievement: true }
          });
          console.log('   🏆 Awarded welcome achievement');
        }
        
        // Award first goal achievement if they have completed goals
        if (completedGoals >= 1 && !user.achievements.find(a => a.id === 'first_goal')) {
          user.achievements.push({
            id: 'first_goal',
            name: 'First Goal Completed',
            description: 'Completed your first learning goal',
            icon: 'trophy',
            earnedAt: new Date(),
            metadata: { migratedAchievement: true }
          });
          console.log('   🏆 Awarded first goal achievement');
        }
        
        // Calculate experience based on completed goals
        const baseExperience = completedGoals * 50; // 50 XP per completed goal
        if (user.progressStats.experience < baseExperience) {
          user.progressStats.experience = baseExperience;
          console.log(`   ⭐ Updated experience to ${baseExperience}`);
        }
        
        // Calculate level based on experience
        let level = 1;
        let totalExperienceNeeded = 0;
        while (totalExperienceNeeded <= user.progressStats.experience) {
          const experienceForThisLevel = 100 + (level - 1) * 50;
          totalExperienceNeeded += experienceForThisLevel;
          if (totalExperienceNeeded <= user.progressStats.experience) {
            level++;
          }
        }
        
        if (user.progressStats.level !== level) {
          user.progressStats.level = level;
          user.progressStats.experience = user.progressStats.experience - (totalExperienceNeeded - (100 + (level - 1) * 50));
          console.log(`   📊 Updated level to ${level}`);
        }
        
        // Add initial activity log entry
        if (user.activityLog.length === 0) {
          user.activityLog.push({
            action: 'account_migrated',
            timestamp: new Date(),
            metadata: {
              migrationDate: new Date(),
              originalCreatedAt: user.createdAt,
              migratedCompletedGoals: completedGoals
            }
          });
          console.log('   📝 Added migration activity log entry');
        }
        
        // Save the user
        await user.save();
        migratedCount++;
        console.log(`   ✅ Successfully migrated user: ${user.name}`);
        
      } catch (userError) {
        console.error(`   ❌ Error migrating user ${user.name}:`, userError.message);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Migration completed!');
    console.log(`✅ Successfully migrated: ${migratedCount} users`);
    console.log(`❌ Errors: ${errorCount} users`);
    
    if (errorCount > 0) {
      console.log('\n⚠️  Please review the errors above and run the migration again if needed.');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

const verifyMigration = async () => {
  try {
    console.log('\n🔍 Verifying migration...');
    
    // Check that all users have the required fields
    const usersWithoutProgressStats = await User.countDocuments({
      progressStats: { $exists: false }
    });
    
    const usersWithoutActivityLog = await User.countDocuments({
      activityLog: { $exists: false }
    });
    
    const usersWithoutAchievements = await User.countDocuments({
      achievements: { $exists: false }
    });
    
    const usersWithoutPreferences = await User.countDocuments({
      preferences: { $exists: false }
    });
    
    console.log(`📊 Users without progressStats: ${usersWithoutProgressStats}`);
    console.log(`📊 Users without activityLog: ${usersWithoutActivityLog}`);
    console.log(`📊 Users without achievements: ${usersWithoutAchievements}`);
    console.log(`📊 Users without preferences: ${usersWithoutPreferences}`);
    
    if (usersWithoutProgressStats === 0 && usersWithoutActivityLog === 0 && 
        usersWithoutAchievements === 0 && usersWithoutPreferences === 0) {
      console.log('✅ All users have been successfully migrated!');
    } else {
      console.log('⚠️  Some users are missing required fields. Please run the migration again.');
    }
    
    // Show some statistics
    const totalUsers = await User.countDocuments({});
    const usersWithAchievements = await User.countDocuments({
      'achievements.0': { $exists: true }
    });
    
    console.log(`\n📈 Migration Statistics:`);
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Users with achievements: ${usersWithAchievements}`);
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    throw error;
  }
};

const rollbackMigration = async () => {
  try {
    console.log('\n🔄 Rolling back migration...');
    
    const result = await User.updateMany(
      {},
      {
        $unset: {
          progressStats: '',
          activityLog: '',
          achievements: '',
          dailyStats: '',
          preferences: '',
          lastLoginDate: '',
          lastActivityDate: ''
        }
      }
    );
    
    console.log(`✅ Rollback completed. Modified ${result.modifiedCount} users.`);
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  await connectDB();
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    switch (command) {
      case 'migrate':
        await migrateUserSchema();
        await verifyMigration();
        break;
      case 'verify':
        await verifyMigration();
        break;
      case 'rollback':
        console.log('⚠️  WARNING: This will remove all progress tracking data!');
        console.log('Are you sure you want to continue? (This action cannot be undone)');
        // In a real environment, you might want to add a confirmation prompt
        await rollbackMigration();
        break;
      default:
        console.log('Usage: node migrateUserSchema.js [migrate|verify|rollback]');
        console.log('');
        console.log('Commands:');
        console.log('  migrate  - Migrate all users to the new schema');
        console.log('  verify   - Verify the migration was successful');
        console.log('  rollback - Remove all new fields (WARNING: Data loss!)');
        break;
    }
  } catch (error) {
    console.error('❌ Command failed:', error);
    process.exit(1);
  }
  
  mongoose.connection.close();
  console.log('\n🔌 Database connection closed.');
};

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  migrateUserSchema,
  verifyMigration,
  rollbackMigration
};