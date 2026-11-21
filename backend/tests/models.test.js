const {
  User,
  Cycle,
  DailyActivity,
  DailyScore,
  WeeklySummary,
  MonthlyResult,
  PushSubscription
} = require('../models');

describe('Mongoose Models & Schemas Verification', () => {
  test('All 7 models should be defined and point to explicit camelCase collections', () => {
    expect(User.collection.name).toBe('users');
    expect(Cycle.collection.name).toBe('cycles');
    expect(DailyActivity.collection.name).toBe('dailyActivities');
    expect(DailyScore.collection.name).toBe('dailyScores');
    expect(WeeklySummary.collection.name).toBe('weeklySummaries');
    expect(MonthlyResult.collection.name).toBe('monthlyResults');
    expect(PushSubscription.collection.name).toBe('pushSubscriptions');
  });

  test('Cycle model should configure partial unique index for active status', () => {
    const indexes = Cycle.schema.indexes();
    // Look for index with { userId: 1, status: 1 } and partialFilterExpression: { status: 'active' }
    const activeCycleIndex = indexes.find(
      ([fields, options]) =>
        fields.userId === 1 &&
        fields.status === 1 &&
        options &&
        options.unique === true &&
        options.partialFilterExpression &&
        options.partialFilterExpression.status === 'active'
    );

    expect(activeCycleIndex).toBeDefined();
  });

  test('DailyActivity model should configure unique compound index on { userId: 1, date: 1 }', () => {
    const indexes = DailyActivity.schema.indexes();
    const uniqueDateIndex = indexes.find(
      ([fields, options]) =>
        fields.userId === 1 && fields.date === 1 && options && options.unique === true
    );
    expect(uniqueDateIndex).toBeDefined();
  });

  test('DailyScore model should configure unique compound index on { userId: 1, date: 1 }', () => {
    const indexes = DailyScore.schema.indexes();
    const uniqueDateIndex = indexes.find(
      ([fields, options]) =>
        fields.userId === 1 && fields.date === 1 && options && options.unique === true
    );
    expect(uniqueDateIndex).toBeDefined();
  });

  test('WeeklySummary model should configure unique index on { userId: 1, cycleId: 1, weekNumber: 1 }', () => {
    const indexes = WeeklySummary.schema.indexes();
    const uniqueWeekIndex = indexes.find(
      ([fields, options]) =>
        fields.userId === 1 &&
        fields.cycleId === 1 &&
        fields.weekNumber === 1 &&
        options &&
        options.unique === true
    );
    expect(uniqueWeekIndex).toBeDefined();
  });

  test('MonthlyResult model should configure unique index on { userId: 1, cycleId: 1 }', () => {
    const indexes = MonthlyResult.schema.indexes();
    const uniqueMonthIndex = indexes.find(
      ([fields, options]) =>
        fields.userId === 1 &&
        fields.cycleId === 1 &&
        options &&
        options.unique === true
    );
    expect(uniqueMonthIndex).toBeDefined();
  });

  test('PushSubscription model should configure unique index on { userId: 1, endpoint: 1 }', () => {
    const indexes = PushSubscription.schema.indexes();
    const uniqueSubIndex = indexes.find(
      ([fields, options]) =>
        fields.userId === 1 &&
        fields.endpoint === 1 &&
        options &&
        options.unique === true
    );
    expect(uniqueSubIndex).toBeDefined();
  });
});
