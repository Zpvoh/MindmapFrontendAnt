import {Component, Input, OnChanges, OnInit} from '@angular/core';

import {SNodeService} from '../s-node.service';
import {NzModalService} from 'ng-zorro-antd';
import {StuMultiple} from '../stu-multiple';
import {StuJudge} from '../stu-judge';
import {StuShort} from '../stu-short';

@Component({
  selector: 'app-s-learning-situation',
  templateUrl: './s-learning-situation.component.html',
  styleUrls: ['./s-learning-situation.component.css']
})
export class SLearningSituationComponent implements OnInit, OnChanges {

  stuMultiples: StuMultiple[];
  stuShorts: StuShort[];
  stuJudges: StuJudge[];
  rank: number;
  score: number;
  relevance: number;
  numberFinish: number;
  numberTotal: number;

  @Input() course_id: string; // 与上层组件中course绑定
  @Input() mind_id: string; // 与上层组件中选中的mindMap绑定
  @Input() node_id: string;

  constructor(
    private nodeService: SNodeService,
    private modalService: NzModalService
  ) {
  }

  ngOnInit() {
  }

  ngOnChanges() {
    this.updateHomework();
    this.updateLearningSituation();
  }

  updateLearningSituation() {
    const recommendStr = JSON.parse(localStorage.getItem('recommendation_list'));
    // this.rank = Number(recommendStr['']);
    for (const v of recommendStr['sortedVertices']) {
      if (v['vertex']['id'] === this.node_id) {
        this.rank = Math.floor((1 - Number(v['value'])) * (recommendStr['sortedVertices'].length - 1) + 1);
        break;
      }
    }

    for (const i in recommendStr['evaluationList']['relevance']) {
      if (recommendStr['evaluationList']['precursorGraph']['vertices'][i]['id'] === this.node_id) {
        this.relevance = recommendStr['evaluationList']['relevance'][i];
        this.numberFinish = recommendStr['evaluationList']['scoreList']['scoreActual'][i].length;
        this.numberTotal = recommendStr['evaluationList']['scoreList']['scoreTotal'][i].length;
        break;
      }
    }
  }

  updateHomework() {
    // 获取所有的选择题
    this.nodeService.getStuMultiple(
      this.course_id,
      this.mind_id,
      this.node_id,
      window.sessionStorage.getItem('user_name')).subscribe(
      value => this.setMultiple(value));

    // 获取所有的简答题
    this.nodeService.getShort(
      this.course_id,
      this.mind_id,
      this.node_id,
      window.sessionStorage.getItem('user_name')).subscribe(
      value => this.setShort(value));

    // 获取所有的选择题
    this.nodeService.getStuJudge(
      this.course_id,
      this.mind_id,
      this.node_id,
      window.sessionStorage.getItem('user_name')).subscribe(
      value => this.setJudge(value));
  }

  setMultiple(value) {
    this.stuMultiples = value;
    for (const stuMultiple of this.stuMultiples) {
      if (stuMultiple.answer !== '') {
        if (stuMultiple['score'] === stuMultiple['fullScore']) {
          stuMultiple['correctness'] = true;
        } else {
          stuMultiple['correctness'] = false;
        }
        stuMultiple.submitted = true;
      }
    }
  }

  setShort(value) {
    this.stuShorts = value;
    for (const stuShort of this.stuShorts) {
      if (stuShort.answer !== '') {
        stuShort.submitted = true;
      }
    }
  }

  setJudge(value) {
    this.stuJudges = value;
    for (const stuJudge of this.stuJudges) {
      if (stuJudge.answer !== '') {
        if (stuJudge['score'] === stuJudge['fullScore']) {
          stuJudge['correctness'] = true;
        } else {
          stuJudge['correctness'] = false;
        }
        console.log(stuJudge);
        stuJudge.submitted = true;
      }
    }
  }

  // 查看正确答案
  checkAnswer(id: string, type: number) {
    this.nodeService.get_real_answer(
      id,
      type,
      window.sessionStorage.getItem('user_name')
    ).subscribe(
      // todo 显示答案
      r => {
        this.modalService.info(
          {
            nzTitle: '参考答案为：',
            nzContent: type === 3 ? (r['answer'] === 'T' ? '正确' : '错误') : r['answer']
          }
        );
      }
    );
  }

}
