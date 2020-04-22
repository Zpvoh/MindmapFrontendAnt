export class MultipleQuestion {
  id: number;
  title: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correct_answer: string; // 正确答案
  correct_number: string; // 答对人数
  number: string; // 答题人数

  value: number; // 表示该题的分数 1-10

  constructor() {
    this.id = undefined;
    this.title = '';
    this.optionA = '';
    this.optionB = '';
    this.optionC = '';
    this.optionD = '';
    this.correct_answer = '';
    this.correct_number = '';
    this.number = '';

    this.value = 1;
  }
}
