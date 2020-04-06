import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import cytoscape from 'cytoscape';
import $ from 'jquery';
import contextMenus from 'cytoscape-context-menus';
import 'cytoscape-context-menus/cytoscape-context-menus.css';
import cose from 'cytoscape-cose-bilkent';
import edgehandles from 'cytoscape-edgehandles';
import {NzModalService} from 'ng-zorro-antd';
import {TMindmapService} from '../t-mindmap.service';
import {TGraphService} from '../t-graph-service';
import {ColorPickerService, Rgba} from 'ngx-color-picker';
import * as jsMind from '../../../assets/jsmind/jsmind';

@Component({
  selector: 'app-t-mindmap-cyto',
  templateUrl: './t-mindmap-cyto.component.html',
  styleUrls: ['./t-mindmap-cyto.component.css']
})

export class TMindmapCytoComponent implements OnInit {
  flag: boolean;

  course_id: string;

  @Input()
  set courseId(course_id: string) {
    this.course_id = course_id;
  }

  mindmap_id: string;

  @Input()
  set mindmapId(mindmap_id: string) {
    this.mindmap_id = mindmap_id;

    if (this.mindmap_id) {
      this.updateMindmapView();
      // this.flag = false;
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
  typeOfNewEdge = 'super-sub';

  constructor(
    private modalService: NzModalService,
    private mindmapService: TMindmapService,
    private graphService: TGraphService,
    private colorService: ColorPickerService
  ) {
  }

  ngOnInit() {
    this.numOfNodes = 0;
    this.flag = true;
    cytoscape.use(cose);
    cytoscape.use(edgehandles);
    cytoscape.use(contextMenus, $);
    // register extension
  }

  ngAfterViewInit() {
    this.readGraph();

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

    const removeEle = function A(target) {
      if (target.group() === 'edges') {
        const edgeTarget = outside.cy.$id(target.data('target'));
        edgeTarget.data('parentID', '');
        console.log('edgeTarget', edgeTarget);
      } else if (target.group() === 'nodes') {
        const judgerEdges = ele => {
          return ele.data.source === target.data('id') || ele.data.target === target.data('id');
        };
        let edge = outside.elements.find(judgerEdges);
        while (edge !== undefined) {
          A(outside.cy.$id(edge.data.id));
          edge = outside.elements.find(judgerEdges);
          console.log(outside.elements);
        }
      }
      const judgerSelf = ele => {
        return ele.data.id === target.data('id');
      };
      const eleIndex = outside.elements.findIndex(judgerSelf);
      outside.elements.splice(eleIndex, 1);
      outside.cy.remove(target);

      outside.isChanged = true;
      outside.modifyContentEvent.emit(outside.isChanged);
    };
    const addFunction = event => {
      const evtTarget = event.target;
      console.log(event);

      if (evtTarget === outside.cy) {
        const nameO = prompt('Give new node a name', 'Node');
        if (nameO === null) {
          return;
        }
        const weightO = 50;
        const labelSizeO = weightO / 4;
        const widthO = labelSizeO * nameO.length + 60;
        const newNode = {
          group: 'nodes',
          data: {
            id: outside.numOfNodes,
            name: nameO,
            weight: weightO,
            width: widthO,
            labelSize: labelSizeO,
            parentID: '',
            flag: true
          },
          position: {x: event.position.x, y: event.position.y}
        };
        outside.cy.add(newNode);
        outside.elements.push(newNode);
        outside.numOfNodes++;
        outside.isChanged = true;
        outside.modifyContentEvent.emit(this.isChanged);
      }
      this.saveGraph();
    };
    const removeFunction = event => {
      // target holds a reference to the originator
      // of the event (core or element)
      const evtTarget = event.target;

      if (evtTarget === outside.cy) {
        console.log('event', event);
      } else {
        console.log(event);
        console.log('evtTarget', evtTarget.group());
        removeEle(evtTarget);
      }

      this.saveGraph();
    };
    const reorganizeFunction = event => {
      const layout = outside.cy.layout({
        name: 'cose-bilkent',
        animate: 'end',
        animationEasing: 'ease-out',
        animationDuration: 1000,
        randomize: true
      });

      layout.run();
    };
    const saveFunction = event => {
      reorganizeFunction(event);
      // outside.saveGraph();
      outside.save();
    };
    const renameFunction = event => {
      const evtTarget = event.target;

      if (evtTarget !== outside.cy) {
        const nameO = prompt('Give node a new name', evtTarget.data('name'));
        if (nameO === null) {
          return;
        }

        const labelSizeO = evtTarget.data('weight') / 4;
        const widthO = labelSizeO * nameO.length + 60;
        evtTarget.data('name', nameO);
        evtTarget.data('labelSize', labelSizeO);
        evtTarget.data('width', widthO);
        outside.isChanged = true;
        outside.modifyContentEvent.emit(this.isChanged);
      }
      this.saveGraph();
    };
    const addParentFunction = event => {
      const evtTarget = event.target;
      console.log(event);

      if (evtTarget.isNode()) {
        const nameO = prompt('Give new node a name', 'Node');
        if (nameO === null) {
          return;
        }
        const weightO = 50;
        const labelSizeO = weightO / 4;
        const widthO = labelSizeO * nameO.length + 60;
        const newNode = {
          group: 'nodes',
          data: {
            id: outside.numOfNodes,
            name: nameO,
            weight: weightO,
            width: widthO,
            labelSize: labelSizeO,
            parentID: '',
            isParent: true,
            flag: true
          }
        };
        const parentO = outside.cy.add(newNode)[0];
        outside.elements.push(newNode);
        const selectedCollection = outside.cy.$(':selected');
        selectedCollection.move({parent: outside.numOfNodes});
        outside.numOfNodes++;
      }
      this.saveGraph();
    };
    const findPreSucPath = function F(src, current) {
      let edgesOut = current.outgoers('edge[type="pre-suc"]');
      if (src === current) {
        return true;
      }

      for (let i = 0; i < edgesOut.length; i++) {
        let result = F(src, edgesOut[i].target());
        if (result === true) {
          return true;
        }
      }
    };

    // this.cy.on('taphold', addFunction);
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
          id: 'remove', // ID of menu item
          content: 'remove', // Display content of menu item
          tooltipText: 'remove', // Tooltip text for menu item
          image: {src: 'remove.svg', width: 12, height: 12, x: 6, y: 4}, // menu icon
          selector: 'node, edge',
          onClickFunction: removeFunction,
          disabled: false, // Whether the item will be created as disabled
          show: true, // Whether the item will be shown or not
          hasTrailingDivider: true, // Whether the item will have a trailing divider
          coreAsWell: false // Whether core instance have this item on cxttap
        },
        {
          id: 'add-node',
          content: 'add node',
          tooltipText: 'add node',
          image: {src: 'add.svg', width: 12, height: 12, x: 6, y: 4},
          selector: 'node',
          coreAsWell: true,
          onClickFunction: addFunction
        },
        {
          id: 'rename-node',
          content: 'rename node',
          tooltipText: 'rename node',
          selector: 'node',
          coreAsWell: false,
          onClickFunction: renameFunction
        },
        {
          id: 'reorganize-node',
          content: 'reorganize',
          tooltipText: 'reorganize',
          image: {src: 'add.svg', width: 12, height: 12, x: 6, y: 4},
          selector: '',
          coreAsWell: true,
          onClickFunction: reorganizeFunction
        },
        {
          id: 'save-node',
          content: 'save graph',
          tooltipText: 'save',
          image: {src: 'add.svg', width: 12, height: 12, x: 6, y: 4},
          selector: '',
          coreAsWell: true,
          onClickFunction: saveFunction
        },
        // {
        //   id: 'add-parent',
        //   content: 'add parent',
        //   tooltipText: 'add parent',
        //   selector: 'node[weight]:selected',
        //   coreAsWell: false,
        //   onClickFunction: addParentFunction
        // }
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
    this.edgeHandleOptions = {
      preview: true, // whether to show added edges preview before releasing selection
      hoverDelay: 150, // time spent hovering over a target node before it is considered selected
      handleNodes: 'node', // selector/filter function for whether edges can be made from a given node
      snap: false, // when enabled, the edge can be drawn by just moving close to a target node
      snapThreshold: 50, // the target node must be less than or equal to this many pixels away from the cursor/finger
      snapFrequency: 15, // the number of times per second (Hz) that snap checks done (lower is less expensive)
      noEdgeEventsInDraw: false, // set events:no to edges during draws, prevents mouseouts on compounds
      disableBrowserGestures: true, // during an edge drawing gesture, disable browser gestures such as
      // two-finger trackpad swipe and pinch-to-zoom
      handlePosition: function (node) {
        return 'middle top'; // sets the position of the handle in the format of "X-AXIS Y-AXIS" such as "left top", "middle top"
      },
      handleInDrawMode: false, // whether to show the handle in draw mode
      edgeType: function (sourceNode, targetNode) {
        // can return 'flat' for flat edges between nodes or 'node' for intermediate node between them
        // returning null/undefined means an edge can't be added between the two nodes
        return 'flat';
      },
      loopAllowed: function (node) {
        // for the specified node, return whether edges from itself to itself are allowed
        return false;
      },
      nodeLoopOffset: -50, // offset for edgeType: 'node' loops
      nodeParams: function (sourceNode, targetNode) {
        // for edges between the specified source and target
        // return element object to be passed to cy.add() for intermediary node
        return {};
      },
      edgeParams: function (sourceNode, targetNode, i) {
        // for edges between the specified source and target
        // return element object to be passed to cy.add() for edge
        // NB: i indicates edge index in case of edgeType: 'node'
        return {};
      },
      ghostEdgeParams: function () {
        // return element object to be passed to cy.add() for the ghost edge
        // (default classes are always added for you)
        return {};
      },
      show: function (sourceNode) {
        // fired when handle is shown
      },
      hide: function (sourceNode) {
        // fired when the handle is hidden
      },
      start: function (sourceNode) {
        // fired when edgehandles interaction starts (drag on handle)
      },
      complete: function (sourceNode, targetNode, addedEles) {
        let codirectedEdges = addedEles.codirectedEdges();
        if (codirectedEdges.length > 0) {
          for (let i = 0; i < codirectedEdges.length; i++) {
            if (codirectedEdges[i].data('type') === outside.typeOfNewEdge) {
              outside.cy.remove(addedEles);
              return;
            }
          }
        }
        if (outside.typeOfNewEdge === 'pre-suc') {
          // 判断是否会因为新边形成环
          const hasCircle = findPreSucPath(sourceNode, targetNode);

          if (hasCircle) {
            outside.cy.remove(addedEles);
            return;
          }
          // targetNode.data('parentID', sourceNode.data('id'));
          addedEles.data('name', '前序知识');
        } else if (outside.typeOfNewEdge === 'super-sub') {
          let root = sourceNode;
          while (root.data('parentID') !== '') {
            root = outside.cy.getElementById(root.data('parentID'));
          }
          console.log('root', root);
          if (addedEles.parallelEdges().length > 1 || targetNode.data('parentID') !== '' || root === targetNode) {
            outside.cy.remove(addedEles);
            return;
          }
          targetNode.data('parentID', sourceNode.data('id'));
          addedEles.data('name', '包含');
        } else if (outside.typeOfNewEdge === 'ref') {
          const nameO = prompt('Give new reference a name', 'Relation');
          if (nameO === null) {
            outside.cy.remove(addedEles);
            return;
          }
          addedEles.data('name', nameO);
        }
        else if (outside.typeOfNewEdge === 'synonym') {
          addedEles.data('name', '同义知识');
        }
        else if (outside.typeOfNewEdge === 'antonym') {
          addedEles.data('name', '反义知识');
        }
        addedEles.data('type', outside.typeOfNewEdge);
        addedEles.data('weight', 10);
        outside.elements.push({
          group: 'edges',
          data: addedEles.data(),
          position: addedEles.position()
        });
        outside.isChanged = true;
        outside.modifyContentEvent.emit(outside.isChanged);
        outside.saveGraph();
      },
      stop: function (sourceNode) {
        // fired when edgehandles interaction is stopped (either complete with added edges or incomplete)
      },
      cancel: function (sourceNode, cancelledTargets) {
        // fired when edgehandles are cancelled (incomplete gesture)
      },
      hoverover: function (sourceNode, targetNode) {
        // fired when a target is hovered
      },
      hoverout: function (sourceNode, targetNode) {
        // fired when a target isn't hovered anymore
      },
      previewon: function (sourceNode, targetNode, previewEles) {
        // fired when preview is shown
      },
      previewoff: function (sourceNode, targetNode, previewEles) {
        // fired when preview is hidden
      },
      drawon: function () {
        // fired when draw mode enabled
      },
      drawoff: function () {
        // fired when draw mode disabled
      }
    };

    const instance = this.cy.contextMenus(this.menuOptions);
    const edgehandler = this.cy.edgehandles(this.edgeHandleOptions);

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

  switchRelationship() {
    if (this.selectedIndex === 0) {
      this.typeOfNewEdge = 'super-sub';
    } else if (this.selectedIndex === 1) {
      this.typeOfNewEdge = 'pre-suc';
    } else if (this.selectedIndex === 2) {
      this.typeOfNewEdge = 'synonym';
    } else if (this.selectedIndex === 3) {
      this.typeOfNewEdge = 'antonym';
    } else if (this.selectedIndex === 4) {
      this.typeOfNewEdge = 'ref';
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

    this.mindmapService.saveMind(this.course_id, this.mindmap_id, str).subscribe(r => {
      if (r['success']) {

        const inModal = this.modalService.success(
          {
            nzTitle: '提交成功',
            nzContent: '已保存思维导图'
          });
        window.setTimeout(() => {
          inModal.destroy();

          this.isChanged = false; // 更新状态
          this.modifyContentEvent.emit(this.isChanged);

        }, 2000);
      } else {

        const inModal = this.modalService.error(
          {
            nzTitle: '提交错误',
            nzContent: '未能保存思维导图'
          });
        window.setTimeout(() => {
          inModal.destroy();
        }, 2000);
      }
    });
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
      console.log(outside.elements);
      this.cy.add(this.elements);
      this.changeLayout();

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
