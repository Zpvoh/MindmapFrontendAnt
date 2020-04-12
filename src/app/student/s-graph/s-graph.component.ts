import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NzModalService} from 'ng-zorro-antd';
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

@Component({
  selector: 'app-s-graph',
  templateUrl: './s-graph.component.html',
  styleUrls: ['./s-graph.component.css']
})
export class SGraphComponent implements OnInit {

  flag: boolean;

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

  constructor(
    private modalService: NzModalService,
    private mindmapService: SMindmapService,
    private recommendationService: SRecommendationService,
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
          content: 'reorganize',
          tooltipText: 'reorganize',
          image: {src: 'add.svg', width: 12, height: 12, x: 6, y: 4},
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

    this.recommendationService.getRecommendation(this.course_id,
      this.mindmap_id,
      window.sessionStorage.getItem('user_name')).subscribe(recommendStr => {
      this.recommendationList = recommendStr;
      localStorage.setItem('recommendation_list', JSON.stringify(recommendStr));
      console.log(this.recommendationList);
      // for (let i = 0; i < recommendStr['sortedVertices'].length; i++) {
      //   const ele = this.cy.getElementById(recommendStr['sortedVertices'][i]['vertex']['id']);
      //   ele.data('color', this.recommendationService.getColor(recommendStr['sortedVertices'][i]['value']));
      // }
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


}
