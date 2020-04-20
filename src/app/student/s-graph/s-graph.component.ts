import {Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {NzButtonComponent, NzModalService} from 'ng-zorro-antd';
import {SMindmapService} from '../s-mindmap.service';
import {SRecommendationService} from '../s-recommendation.service';
import cytoscape from 'cytoscape';
import $ from 'jquery';
import contextMenus from 'cytoscape-context-menus';
import 'cytoscape-context-menus/cytoscape-context-menus.css';
import cose from 'cytoscape-cose-bilkent';
import edgehandles from 'cytoscape-edgehandles';
import {ColorPickerService, Rgba} from 'ngx-color-picker';
import {forEach} from '@angular/router/src/utils/collection';
import {StuMultiple} from '../stu-multiple';
import {StuShort} from '../stu-short';
import {StuJudge} from '../stu-judge';
import {SNodeService} from '../s-node.service';

@Component({
  selector: 'app-s-graph',
  templateUrl: './s-graph.component.html',
  styleUrls: ['./s-graph.component.css']
})
export class SGraphComponent implements OnInit {

  flag: boolean;

  @ViewChild('testTitle')
  testTitle: TemplateRef<{}>;

  @ViewChild('testMultipleContent')
  testMultipleContent: TemplateRef<{}>;

  @ViewChild('testJudgeContent')
  testJudgeContent: TemplateRef<{}>;

  @ViewChild('testShortContent')
  testShortContent: TemplateRef<{}>;

  @ViewChild('testFooter')
  testFooter: TemplateRef<{}>;

  course_id: string; // 课程id
  @Input()
  set courseId(course_id: string) {
    this.course_id = course_id;
  }

  mindmap_id: string; // 思维导图id
  @Input()
  set mindmapId(mindmap_id: string) {
    this.mindmap_id = mindmap_id;

    if (this.mindmap_id) {
      this.updateMindmapView();
      // this.updateMindmapNodeCount();
    }
  }

  accuracyMode: boolean;

  @Input()
  set inAccuracyMode(accuracyMode: boolean) {
    this.accuracyMode = accuracyMode;
  }

  mindStr: any;

  public mindMap; // 思维导图组件

  selected_node_id: string; // 当前思维导图中被选中的节点
  @Output() selectNodeEvent = new EventEmitter<string>();
  selected_node;

  isChanged = false; // 记录思维导图是否被编辑过
  @Output() modifyContentEvent = new EventEmitter<boolean>();

  font_color: string; // 记录选中的字体颜色
  node_color: string; // 记录选中的节点颜色

  showBarCharts = false;

  stuMultiples: StuMultiple[];
  stuShorts: StuShort[];
  stuJudges: StuJudge[];
  currentQuestion: any;
  currentQuestionType: string;

  testModal = undefined;
  isLoadingTest = false;
  isLoadingNext = false;
  isLoadingRecommendation = false;
  finishNumber = 0;

  cy = cytoscape({});
  graphMeta = {};
  graphFormat = '';
  elements = [];
  numOfNodes = 0;
  selectedElements = [];
  menuOptions = {};
  edgeHandleOptions = {};
  selectedIndex = 0;
  recommendationList = undefined;
  testList = undefined;

  constructor(
    private modalService: NzModalService,
    private mindmapService: SMindmapService,
    private recommendationService: SRecommendationService,
    private nodeService: SNodeService,
    private colorService: ColorPickerService
  ) {
  }

  ngOnInit() {
    this.numOfNodes = 0;
    this.flag = true;
    cytoscape.use(cose);
    cytoscape.use(contextMenus, $);
    // register extension
  }

  ngAfterViewInit() {
    // this.readGraph();

    this.cy = cytoscape({

      container: document.getElementById('cy'),

      elements: this.elements,

      layout: {
        name: 'preset'
      },
      style: [
        {
          selector: 'node',
          style: {
            // 'label': 'data(id)',
            'background-color': 'red',
            width: 10,
            height: 10
          }
        },
        {
          selector: 'node[weight]',
          style: {
            label: 'data(name)',
            'text-halign': 'center',
            'text-valign': 'center',
            'font-size': 'data(labelSize)',
            color: 'rgba(255, 245, 247, 1)',
            'background-color': 'rgba(254, 67, 101, 1)',
            shape: 'round-rectangle',
            width: 'data(width)',
            height: 'data(weight)'
          }
        },
        {
          selector: 'node[weight][color]',
          style: {
            label: 'data(name)',
            'text-halign': 'center',
            'text-valign': 'center',
            'font-size': 'data(labelSize)',
            color: 'rgba(255, 245, 247, 1)',
            'background-color': 'data(color)',
            shape: 'round-rectangle',
            width: 'data(width)',
            height: 'data(weight)'
          }
        },
        {
          selector: 'node[weight]:selected',
          style: {
            label: 'data(name)',
            'text-halign': 'center',
            'text-valign': 'center',
            'font-size': 'data(labelSize)',
            color: 'rgba(255, 245, 247, 1)',
            'background-color': 'rgba(255, 200, 101, 1)',
            shape: 'round-rectangle',
            width: 'data(width)',
            height: 'data(weight)'
          }
        },
        {
          selector: 'node:parent',
          style: {
            label: 'data(name)',
            'text-halign': 'left',
            'text-valign': 'top',
            'font-size': 'data(labelSize)',
            color: 'black',
            'background-color': 'rgb(200,200,200)',
            'border-color': 'black',
            shape: 'round-rectangle',
            width: 'data(width)',
            height: 'data(weight)'
          }
        },
        {
          selector: 'node:parent:selected',
          style: {
            label: 'data(name)',
            'text-halign': 'left',
            'text-valign': 'top',
            'font-size': 'data(labelSize)',
            color: 'rgba(255, 245, 247, 0.5)',
            'background-color': 'rgb(150,150,150)',
            shape: 'round-rectangle',
            width: 'data(width)',
            height: 'data(weight)'
          }
        },
        // {
        //   selector: 'node[weight]',
        //   style: {
        //     label: 'data(name)',
        //     'text-halign': 'center',
        //     'text-valign': 'center',
        //     'font-size': 'data(labelSize)',
        //     'color': 'black',
        //     'background-color': 'white',
        //     shape: 'rectangle',
        //     width: 'data(width)',
        //     height: 'data(weight)',
        //     'border-width': 2
        //   }
        // },
        {
          selector: 'edge',
          style: {
            label: 'data(name)',
            'font-size': '10',
            width: 2,
            'line-color': 'rgba(252, 157, 154, 1)',
            'target-arrow-color': 'rgba(252, 157, 154, 1)',
            'curve-style': 'bezier',
            'target-arrow-shape': 'vee'
          }
        },
        {
          selector: 'edge[type="super-sub"]',
          style: {
            'line-style': 'solid'
          }
        },
        {
          selector: 'edge[type="pre-suc"]',
          style: {
            'line-style': 'solid'
          }
        },
        {
          selector: 'edge[type="synonym"]',
          style: {
            'line-style': 'dotted',
            'target-arrow-shape': 'none',
            'line-fill': 'radial-gradient'
          }
        },
        {
          selector: 'edge[type="antonym"]',
          style: {
            'line-style': 'dotted',
            'target-arrow-shape': 'none'
          }
        },
        {
          selector: 'edge[type="ref"]',
          style: {
            'line-style': 'dashed'
          }
        }
      ]

    });
    const outside = this;

    const reorganizeFunction = event => {
      const lay = outside.cy.layout({
        name: 'cose-bilkent',
        animate: 'end',
        animationEasing: 'ease-out',
        animationDuration: 1000,
        randomize: true
      });

      lay.run();
    };

    this.cy.on('select', event => {
      const evtTarget = event.target;
      if (evtTarget.isNode()) {
        if (outside.selectedElements.length !== 0) {
          outside.selectedElements[0].unselect();
          outside.selectedElements.splice(0, 1);
        }
        outside.selectedElements.push(evtTarget);
        console.log(outside.selectedElements);

        this.selectNodeEvent.emit(evtTarget.data('id')); // 向上发射选中节点事件

        window.sessionStorage.setItem('node_id', evtTarget.data('id'));
      }
    });
    this.cy.on('unselect', event => {
      const evtTarget = event.target;
      if (evtTarget.isNode()) {
        const i = outside.selectedElements.findIndex(ele => {
          return ele === evtTarget;
        });
        outside.selectedElements.splice(i, 1);
        console.log(outside.selectedElements);

        this.selectNodeEvent.emit(''); // 向上发射选中节点事件

        window.sessionStorage.setItem('node_id', '');
      }
    });

    this.menuOptions = {
      // List of initial menu items
      menuItems: [
        {
          id: 'reorganize-node',
          content: '重新组织图谱',
          tooltipText: '重新组织图谱',
          selector: '',
          coreAsWell: true,
          onClickFunction: reorganizeFunction
        }
      ],
      // css classes that menu items will have
      menuItemClasses: [
        // add class names to this list
      ],
      // css classes that context menu will have
      contextMenuClasses: [
        // add class names to this list
      ]
    };

    const instance = this.cy.contextMenus(this.menuOptions);

    const layout = this.cy.layout({
      name: 'cose-bilkent',
      animate: 'end',
      animationEasing: 'ease-out',
      animationDuration: 1000,
      randomize: true
    });

    layout.run();
  }

  updateMindmapView() {
    this.cy.remove('');
    this.readGraph();
  }

  switchMode() {
    if (this.selectedIndex === 0) {
      const eles = this.cy.nodes();
      eles.data('color', 'rgba(254, 67, 101, 1)');
    } else if (this.selectedIndex === 1) {
      for (let i = 0; i < this.recommendationList['evaluationList']['precursorGraph']['vertices'].length; i++) {
        const ele = this.cy.getElementById(this.recommendationList['evaluationList']['precursorGraph']['vertices'][i]['id']);
        ele.data('color', this.recommendationService.getColor(this.recommendationList['evaluationList']['values'][i]));
      }
    } else if (this.selectedIndex === 2) {
      for (let i = 0; i < this.recommendationList['sortedVertices'].length; i++) {
        const ele = this.cy.getElementById(this.recommendationList['sortedVertices'][i]['vertex']['id']);
        ele.data('color', this.recommendationService.getColor(this.recommendationList['sortedVertices'][i]['value']));
      }
    }
  }

  openTestModal() {
    this.getQuestions();
  }

  fetchOneQuestion() {
    if (this.stuMultiples && this.stuMultiples.length !== 0) {
      this.currentQuestion = this.stuMultiples[0];
      this.currentQuestionType = 'multiple';
      this.testModal = this.modalService.create({
        nzTitle: this.testTitle,
        nzContent: this.testMultipleContent,
        nzFooter: this.testFooter,
        nzMaskClosable: false,
        nzClosable: false
      });
    } else if (this.stuJudges && this.stuJudges.length !== 0) {
      this.currentQuestion = this.stuJudges[0];
      this.currentQuestionType = 'judge';
      this.testModal = this.modalService.create({
        nzTitle: this.testTitle,
        nzContent: this.testJudgeContent,
        nzFooter: this.testFooter,
        nzMaskClosable: false,
        nzClosable: false
      });
    } else if (this.stuShorts && this.stuShorts.length !== 0) {
      this.currentQuestion = this.stuShorts[0];
      this.currentQuestionType = 'short';
      this.testModal = this.modalService.create({
        nzTitle: this.testTitle,
        nzContent: this.testShortContent,
        nzFooter: this.testFooter,
        nzMaskClosable: false,
        nzClosable: false
      });
    } else {
      this.testList.splice(0, 1);
      this.getQuestions();
    }
  }

  nextTestAnswer() {
    console.log(this.currentQuestion);
    if (this.currentQuestionType === 'multiple') {
      this.submitMultiple(this.currentQuestion);
    } else if (this.currentQuestionType === 'judge') {
      this.submitJudge(this.currentQuestion);
    } else if (this.currentQuestionType === 'short') {
      this.submitShort(this.currentQuestion);
    }
  }

  revaluateGraph() {
    this.isLoadingRecommendation = true;
    this.recommendationService.getRecommendation(this.course_id,
      this.mindmap_id,
      window.sessionStorage.getItem('user_name')).subscribe(recommendStr => {
      this.isLoadingRecommendation = false;
      this.recommendationList = recommendStr[0];
      this.testList = recommendStr[1];
      localStorage.setItem('recommendation_list', JSON.stringify(recommendStr[0]));
      localStorage.setItem('test_list', JSON.stringify(recommendStr[1]));
      console.log(this.recommendationList);
      console.log(this.testList);
      this.testModal.destroy();
    });
  }

  getQuestions() {
    if (this.testList === undefined || this.testList.length === 0) {
      this.revaluateGraph();
      this.modalService.info({
        nzTitle: '恭喜你！已经做完所有测试题啦！'
      });
    }

    const node_id = this.testList[0]['vertex']['id'];
    window.sessionStorage.setItem('test_node', node_id);

    if (this.stuJudges === undefined || this.stuJudges.length === 0) {
      this.isLoadingTest = true;
      this.nodeService.getStuJudge(this.course_id,
        this.mindmap_id,
        node_id,
        window.sessionStorage.getItem('user_name')).subscribe(judges => {
        this.stuJudges = judges;
        let i = 0;
        while (i < this.stuJudges.length) {
          if (this.stuJudges[i].answer !== '') {
            this.stuJudges.splice(i, 1);
          } else {
            i++;
          }
        }

        console.log(this.stuJudges);
        this.finishNumber++;
        if (this.finishNumber === 3) {
          this.finishNumber = 0;
          this.isLoadingTest = false;
          this.fetchOneQuestion();
        }
      });
    } else {
      this.finishNumber++;
    }

    if (this.stuShorts === undefined || this.stuShorts.length === 0) {
      this.isLoadingTest = true;
      this.nodeService.getShort(this.course_id,
        this.mindmap_id,
        node_id,
        window.sessionStorage.getItem('user_name')).subscribe(shorts => {
        this.stuShorts = shorts;
        let i = 0;
        while (i < this.stuShorts.length) {
          if (this.stuShorts[i].answer !== '') {
            this.stuShorts.splice(i, 1);
          } else {
            i++;
          }
        }

        console.log(this.stuShorts);
        this.finishNumber++;
        if (this.finishNumber === 3) {
          this.finishNumber = 0;
          this.isLoadingTest = false;
          this.fetchOneQuestion();
        }
      });
    } else {
      this.finishNumber++;
    }

    if (this.stuMultiples === undefined || this.stuMultiples.length === 0) {
      this.isLoadingTest = true;
      this.nodeService.getStuMultiple(this.course_id,
        this.mindmap_id,
        node_id,
        window.sessionStorage.getItem('user_name')).subscribe(multiples => {
        this.stuMultiples = multiples;
        let i = 0;
        while (i < this.stuMultiples.length) {
          if (this.stuMultiples[i].answer !== '') {
            this.stuMultiples.splice(i, 1);
          } else {
            i++;
          }
        }

        console.log(this.stuMultiples);
        this.finishNumber++;
        if (this.finishNumber === 3) {
          this.finishNumber = 0;
          this.isLoadingTest = false;
          this.fetchOneQuestion();
        }
      });
    } else {
      this.finishNumber++;
    }
  }

  // 提交选择题
  submitMultiple(stuMultiple: StuMultiple) {
    this.isLoadingNext = true;
    this.nodeService.answerMultiple(
      this.course_id,
      this.mindmap_id,
      window.sessionStorage.getItem('test_node'),
      window.sessionStorage.getItem('user_name'),
      stuMultiple).subscribe(
      value => {
        this.checkSubmit(value['success']);
        this.isLoadingNext = false;
        stuMultiple.submitted = true;
        this.stuMultiples.splice(0, 1);
        this.testModal.destroy();
        this.fetchOneQuestion();
      });
  }

  // 提交简答题
  submitShort(stuShort: StuShort) {
    this.isLoadingNext = true;
    this.nodeService.answerShort(
      this.course_id,
      this.mindmap_id,
      window.sessionStorage.getItem('test_node'),
      window.sessionStorage.getItem('user_name'),
      stuShort).subscribe(
      value => {
        this.checkSubmit(value['success']);
        this.isLoadingNext = false;
        stuShort.submitted = true;
        this.stuShorts.splice(0, 1);
        this.testModal.destroy();
        this.fetchOneQuestion();
      }
    );
  }

  // 提交判断题
  submitJudge(stuJudge: StuJudge) {
    this.isLoadingNext = true;
    this.nodeService.answerJudge(
      this.course_id,
      this.mindmap_id,
      window.sessionStorage.getItem('test_node'),
      window.sessionStorage.getItem('user_name'),
      stuJudge).subscribe(
      value => {
        this.checkSubmit(value['success']);
        this.isLoadingNext = false;
        stuJudge.submitted = true;
        this.stuJudges.splice(0, 1);
        this.testModal.destroy();
        this.fetchOneQuestion();
      });
  }

  // 检查提交
  checkSubmit(value) {
    if (!value) {
      this.isLoadingNext = false;
      const inModal = this.modalService.error(
        {
          nzTitle: '提交失败',
          nzContent: '未知错误'
        });
      window.setTimeout(() => {
        inModal.destroy();
      }, 2000);
    }
  }

  saveGraph() {
    // localStorage.setItem('cy-elements', JSON.stringify(this.elements));
    localStorage.setItem('cy-node-num', this.numOfNodes.toString());
  }

  save() {
    console.log(this.elements);
    const graph_json = {
      'meta': this.graphMeta,
      'format': this.graphFormat,
      'jsonData': this.elements
    };

    const str = JSON.stringify(graph_json); // 最终要传输的字符串

    // this.mindmapService.saveMind(this.course_id, this.mindmap_id, str).subscribe(r => {
    //   if (r['success']) {
    //
    //     const inModal = this.modalService.success(
    //       {
    //         nzTitle: '提交成功',
    //         nzContent: '已保存思维导图'
    //       });
    //     window.setTimeout(() => {
    //       inModal.destroy();
    //
    //       this.isChanged = false; // 更新状态
    //       this.modifyContentEvent.emit(this.isChanged);
    //
    //     }, 2000);
    //   } else {
    //
    //     const inModal = this.modalService.error(
    //       {
    //         nzTitle: '提交错误',
    //         nzContent: '未能保存思维导图'
    //       });
    //     window.setTimeout(() => {
    //       inModal.destroy();
    //     }, 2000);
    //   }
    // });
  }

  readGraph() {
    // let elementsTmp = localStorage.getItem('cy-elements');
    const numOfNodesTmp = localStorage.getItem('cy-node-num');
    if (numOfNodesTmp !== null) {
      //   this.elements = JSON.parse(elementsTmp);
      this.numOfNodes = parseInt(numOfNodesTmp, 10);
    }
    const outside = this;
    this.mindmapService.getMindmap(this.course_id, this.mindmap_id).subscribe(mindStr => {

      outside.graphMeta = mindStr['meta'];
      outside.graphFormat = mindStr['format'];
      outside.elements = mindStr['jsonData'];
      localStorage.setItem('cy-elements', JSON.stringify(outside.elements));
      this.cy.add(this.elements);
      this.changeLayout();

    });

    this.isLoadingTest = true;
    this.recommendationService.getRecommendation(this.course_id,
      this.mindmap_id,
      window.sessionStorage.getItem('user_name')).subscribe(recommendStr => {
      this.isLoadingTest = false;
      this.recommendationList = recommendStr[0];
      this.testList = recommendStr[1];
      localStorage.setItem('recommendation_list', JSON.stringify(recommendStr[0]));
      localStorage.setItem('test_list', JSON.stringify(recommendStr[1]));
      console.log(this.recommendationList);
      console.log(this.testList);
    });
  }

  recreateNodes() {
    const numOfNodes = 5;
    const result = [];
    for (let i = 0; i < numOfNodes; i++) {
      const weightO = Math.random() * 30 + 10;
      const nameO = 'Node ' + i;
      const labelSizeO = weightO / 2;
      const widthO = labelSizeO / 2 * nameO.length + 10;
      result.push({
        group: 'nodes',
        data: {
          id: i,
          name: nameO,
          weight: weightO,
          width: widthO,
          labelSize: labelSizeO,
          flag: true
        }
      });
      this.numOfNodes++;
    }

    for (let i = 0; i < numOfNodes; i++) {
      for (let j = 0; j < numOfNodes; j++) {
        const flag = Math.random();
        if (flag < 0.5 && i !== j) {
          result.push({
            group: 'edges',
            data: {
              id: i + '->' + j,
              source: i,
              target: j,
              arrow: 'vee',
              flag: true
            }
          });
        }
      }
    }

    return result;
  }

  changeLayout() {
    const layout = this.cy.layout({
      name: 'cose-bilkent',
      animate: 'end',
      animationEasing: 'ease-out',
      animationDuration: 1000,
      randomize: true
    });

    layout.run();
  }

  enterAccuracyMode() {
  }

  exitAccuracyMode() {
  }

  screen_shot() {

  }

}
