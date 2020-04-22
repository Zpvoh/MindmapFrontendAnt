export class StuShort {
  assignmentLongId: number;
  title: string;
  answer: string;

  submitted: boolean;

  constructor() {
    this.assignmentLongId = 0;
    this.title = '';
    this.answer = '';

    this.submitted = false;
  }
}
