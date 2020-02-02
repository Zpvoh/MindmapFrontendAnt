import {Component, Input, OnChanges, OnInit, TemplateRef} from '@angular/core';

import {TNodeService} from '../t-node.service';
import {MultipleQuestion} from '../multiple-question';
import {ShortQuestion} from '../short-question';
import {NzModalRef, NzModalService} from 'ng-zorro-antd';
import {JudgeQuestion} from '../judge-question';

@Component({
  selector: 'app-t-homework',
  templateUrl: './t-homework.component.html',
  styleUrls: ['./t-homework.component.css']
})
export class THomeworkComponent implements OnInit, OnChanges {


  multipleQuestions: MultipleQuestion[]; // 选择题列表
  shortQuestions: any[]; // 简答题列表
  judgeQuestions: JudgeQuestion[];

  // 添加选择题与简答题用
  multiple: MultipleQuestion = new MultipleQuestion();
  short: ShortQuestion = new ShortQuestion();
  judge: JudgeQuestion = new JudgeQuestion();

  @Input() course_id: string; // 与上层组件中course绑定
  @Input() mind_id: string; // 与上层组件中选中的mindMap绑定
  @Input() node_id: string;

  tplModal: NzModalRef; // 用于发布新的题目

  constructor(
    private nodeService: TNodeService,
    private modalService: NzModalService
  ) {
  }

  ngOnInit() {
    this.updateHomework();
  }

  ngOnChanges() {
    this.updateHomework();
  }


  updateHomework() {
    // 获取所有的选择题
    this.nodeService.getMultiple(
      this.course_id,
      this.mind_id,
      this.node_id).subscribe(
      value => {
        this.setMultiple(value);
      }
    );

    // 获取所有的简答题
    this.nodeService.getShort(
      this.course_id,
      this.mind_id,
      this.node_id).subscribe(
      value => this.setShort(value));

    this.nodeService.getJudge(
      this.course_id,
      this.mind_id,
      this.node_id).subscribe(
      value => this.setJudge(value));
  }

  setMultiple(value) {
    this.multipleQuestions = value;
  }

  setShort(value) {
    this.shortQuestions = value;
  }

  setJudge(value) {
    this.judgeQuestions = value;
  }

  openReleaseModal(
    tplTitle: TemplateRef<{}>,
    tplContent: TemplateRef<{}>,
    tplFooter: TemplateRef<{}>
  ) {
    this.tplModal = this.modalService.create({
      nzTitle: tplTitle,
      nzContent: tplContent,
      nzFooter: tplFooter,
      nzMaskClosable: false
    });
  }

  releaseMultiple() {
    // 发布选择题
    this.nodeService.releaseMutiple(
      this.course_id,
      this.mind_id,
      this.node_id,
      this.multiple)
      .subscribe(
        (value) => {
          this.checkMultiple(value['success']);
        }
      );
  }

  releaseShort() {
    // 发布简答题
    this.nodeService.releaseShort(
      this.course_id,
      this.mind_id,
      this.node_id,
      this.short)
      .subscribe((value => this.checkShort(value['success'])));
  }

  correctShort(assignment_id, student_id, score) {
    // 批改简答题
    this.nodeService.correctShort(assignment_id, student_id, score).subscribe((value => this.checkCorrectShort(value['success'])));
  }

  releaseJudge() {
    // 发布简答题
    this.nodeService.releaseJudge(
      this.course_id,
      this.mind_id,
      this.node_id,
      this.judge)
      .subscribe((value => this.checkJudge(value['success'])));
  }

  checkMultiple(value) {
    if (value) {
      // 如果发布成功则重新加载作业（以获取最新添加的作业）
      this.alertSuccess('发布成功', '选择题列表已更新');

      this.updateHomework();
      // 如果发布成功则新建一个选择题（清除缓存）
      this.multiple = new MultipleQuestion();
    }
  }

  checkShort(value) {
    if (value) {
      this.alertSuccess('发布成功', '简答题列表已更新');

      this.updateHomework();
      this.short = new ShortQuestion();
    }
  }

  checkCorrectShort(value) {
    if (value) {
      this.alertSuccess('批改成功', '简答题批改结果已更新');

      this.updateHomework();
      this.short = new ShortQuestion();
    }
  }

  checkJudge(value) {
    if (value) {
      // 如果发布成功则重新加载作业（以获取最新添加的作业）
      this.alertSuccess('发布成功', '判断题列表已更新');

      this.updateHomework();
      // 如果发布成功则新建一个选择题（清除缓存）
      this.judge = new MultipleQuestion();
    }
  }

  alertSuccess(title: string, content: string) {
    const inModal = this.modalService.success(
      {
        nzTitle: title,
        nzContent: content
      });
    window.setTimeout(() => {
      inModal.destroy();
      this.tplModal.destroy();
    }, 2000);
  }

}
