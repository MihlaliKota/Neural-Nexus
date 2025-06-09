const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to the User model
    },
    description: {
      type: String,
      required: [true, 'Please add a goal description'],
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    category: {
      type: String,
      enum: [
        'web-development',
        'data-science',
        'mobile-development',
        'devops',
        'design',
        'business',
        'language',
        'general'
      ],
      default: 'general'
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'paused'],
      default: 'pending'
    },
    targetDate: {
      type: Date,
      validate: {
        validator: function(date) {
          return !date || date > Date.now();
        },
        message: 'Target date must be in the future'
      }
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot be more than 1000 characters']
    },
    // 🎯 ADD CURRICULUM STORAGE
    curriculum: {
      type: String,
      maxlength: [50000, 'Curriculum cannot be more than 50000 characters'] // Large limit for AI content
    },
    curriculumGeneratedAt: {
      type: Date
    },
    hasCurriculum: {
      type: Boolean,
      default: false
    },
    makeComExecutionId: {
      type: String // For tracking Make.com execution
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: true // This will automatically manage createdAt and updatedAt
  }
);

// Update hasCurriculum when curriculum is set
goalSchema.pre('save', function(next) {
  if (this.curriculum && this.curriculum.length > 0) {
    this.hasCurriculum = true;
    if (!this.curriculumGeneratedAt) {
      this.curriculumGeneratedAt = new Date();
    }
  } else {
    this.hasCurriculum = false;
  }
  next();
});

// Index for faster queries
goalSchema.index({ user: 1, createdAt: -1 });
goalSchema.index({ user: 1, status: 1 });
goalSchema.index({ user: 1, priority: 1 });
goalSchema.index({ user: 1, hasCurriculum: 1 }); // Index for curriculum queries

// Virtual for time remaining until target date
goalSchema.virtual('timeRemaining').get(function() {
  if (!this.targetDate) return null;
  
  const now = new Date();
  const target = new Date(this.targetDate);
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return {
    days: diffDays,
    isOverdue: diffDays < 0,
    formatted: diffDays < 0 ? `${Math.abs(diffDays)} days overdue` : `${diffDays} days remaining`
  };
});

// Ensure virtual fields are serialized
goalSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Goal', goalSchema);