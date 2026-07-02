export const calculateBmi = (height: number, weight: number): string => {
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  if (bmi < 16) return 'Underweight (Severe thinness)';
  if (bmi < 17) return 'Underweight (Moderate thinness)';
  if (bmi < 18.5) return 'Underweight (Mild thinness)';
  if (bmi < 25) return 'Normal range';
  if (bmi < 30) return 'Overweight (Pre-obese)';
  if (bmi < 35) return 'Obese (Class I)';
  if (bmi < 40) return 'Obese (Class II)';

  return 'Obese (Class III)';
};

interface BmiValues {
  height: number;
  weight: number;
}

const parseBmi = (args: string[]): BmiValues => {
  if (args.length < 4) throw new Error('Not enough values');
  if (args.length > 4) throw new Error('Too many values');

  const height = Number(args[2]);
  const weight = Number(args[3]);

  if (isNaN(height) || isNaN(weight)) {
    throw new Error('Provided values were not numbers');
  }

  return {
    height,
    weight
  };
};

if (process.argv[1] === import.meta.filename) {
  try {
    const { height, weight } = parseBmi(process.argv);
    console.log(calculateBmi(height, weight));
  } catch (error: unknown) {
    let errorMessage = 'Something went wrong.';

    if (error instanceof Error) {
      errorMessage += ' Error: ' + error.message;
    }

    console.log(errorMessage);
  }
}