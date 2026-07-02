interface ExerciseResult {
  periodLength: number;
  trainingDays: number;
  success: boolean;
  rating: number;
  ratingDescription: string;
  target: number;
  average: number;
}

const calculateExercises = (
  dailyExerciseHours: number[],
  target: number,
): ExerciseResult => {
  const periodLength = dailyExerciseHours.length;
  const trainingDays = dailyExerciseHours.filter((hours) => hours > 0).length;
  const totalHours = dailyExerciseHours.reduce((sum, hours) => sum + hours, 0);
  const average = totalHours / periodLength;
  const success = average >= target;

  const minimumTargetRatio = 0.75;

  let rating: number;
  let ratingDescription: string;

  if (average < target * minimumTargetRatio) {
    rating = 1;
    ratingDescription = "not great, you need to exercise more";
  } else if (average < target) {
    rating = 2;
    ratingDescription = "not too bad but could be better";
  } else {
    rating = 3;
    ratingDescription = "good job meeting your target";
  }

  return {
    periodLength,
    trainingDays,
    success,
    rating,
    ratingDescription,
    target,
    average,
  };
};

const parseExercise = (
  args: string[],
): { target: number; dailyExerciseHours: number[] } => {
  if (args.length < 4) {
    throw new Error('Not enough values"');
  }

  const target = Number(args[2]);
  const dailyExerciseHours = args.slice(3).map((hours) => Number(hours));

  if (isNaN(target) || dailyExerciseHours.some((hours) => isNaN(hours))) {
    throw new Error("Insert numbers only");
  }

  return {
    target,
    dailyExerciseHours,
  };
};

try {
  const { target, dailyExerciseHours } = parseExercise(process.argv);
  console.log(calculateExercises(dailyExerciseHours, target));
} catch (error: unknown) {
  let errorMessage = "Something went wrong.";

  if (error instanceof Error) {
    errorMessage += " Error: " + error.message;
  }

  console.log(errorMessage);
}
