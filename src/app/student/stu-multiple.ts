export class StuMultiple {
  assignmentLongId: number;
  title: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
  score: number;
  fullScore: number;

  submitted: boolean;

  constructor() {
    this.assignmentLongId = 0;
    this.title = '';
    this.optionA = '';
    this.optionB = '';
    this.optionC = '';
    this.optionD = '';
    this.answer = '';

    this.submitted = false;
  }
}
