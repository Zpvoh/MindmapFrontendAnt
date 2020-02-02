import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';

import * as jsMind from '../../../assets/jsmind/jsmind.js';
import '../../../assets/jsmind/jsmind.screenshot.js';
import {TMindmapService} from '../t-mindmap.service';
import {NzModalService} from 'ng-zorro-antd';
import { ColorPickerService, Rgba} from 'ngx-color-picker';
import cytoscape from 'cytoscape';
import EChartOption = echarts.EChartOption;

const options = {
  container: 'jsmind_container',
  theme: 'greensea',
  editable: true
};

@Component({
  selector: 'app-t-mindmap',
  templateUrl: './t-mindmap.component.html',
  styleUrls: ['./t-mindmap.component.css']
})
export class TMindmapComponent implements OnInit {

  course_id: string;
  @Input()
  set courseId(course_id: string) {
    this.course_id = course_id;
  }

  mindmap_id: string;
  @Input()
  set mindmapId(mindmap_id: string) {
    this.mindmap_id = mindmap_id;
    // console.log(mindmap_id);

    if (this.mindmap_id) {
      this.updateMindmapView();
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
  chartOption: EChartOption; // 柱状图数据

  constructor(
    private modalService: NzModalService,
    private mindmapService: TMindmapService,
    private colorService: ColorPickerService
  ) { }

  ngOnInit() {

    this.selected_node_id = '';
    // this.init_str = jsMind.util.json.json2string(init_data);

  }

  // 显示新的mindMap
  updateMindmapView() {

    this.mindmapService.getMindmap(this.course_id, this.mindmap_id).subscribe(mindStr => {

      this.mindStr = mindStr;

      if (!this.mindMap) {
        this.mindMap = jsMind.show(options, this.mindStr);
      } else {
        this.mindMap.show(this.mindStr);
      }

    });

  }

  screen_shot() {
    this.mindMap.screenshot.shootDownload();
  }

  remove(): void {
    const selected_id = this.mindMap.get_selected_node();
    if (!selected_id) {
      return;
    }

    this.isChanged = true;
    this.modifyContentEvent.emit(this.isChanged);

    this.mindMap.remove_node(selected_id);

    this.update_selected_knowledge_id();
  }

  add_child() {
    const selected_node = this.mindMap.get_selected_node(); // as parent of new node
    if (!selected_node) {
      return;
    }

    this.isChanged = true;
    this.modifyContentEvent.emit(this.isChanged);

    const nodeid = jsMind.util.uuid.newid();
    const topic = '* 新节点 *';
    this.mindMap.add_node(selected_node, nodeid, topic);
  }

  add_precursor() {
    return;
  }

  add_brother(): void {
    const selected_node = this.mindMap.get_selected_node(); // as parent of new node

    if (!selected_node || selected_node.isroot) {
      return;
    }

    this.isChanged = true;
    this.modifyContentEvent.emit(this.isChanged);

    const nodeid = jsMind.util.uuid.newid();
    const topic = '* 新节点 *';
    this.mindMap.insert_node_after(selected_node, nodeid, topic);
  }

  private get_selected_nodeid() {
    const selected_node = this.mindMap.get_selected_node();
    console.log(selected_node.id); // todo delete
    if (!!selected_node) {
      return selected_node.id;
    }
  }

  change_node_color(color: string) {
    const selected_id = this.get_selected_nodeid();
    if (selected_id) {

      this.isChanged = true;
      this.modifyContentEvent.emit(this.isChanged);

      this.mindMap.set_node_color(selected_id, color, null);
    }

  }

  change_font_color(color: string) {
    const selected_id = this.get_selected_nodeid();
    if (selected_id) {

      this.isChanged = true;
      this.modifyContentEvent.emit(this.isChanged);

      this.mindMap.set_node_color(selected_id, null, color);
    }

  }

  update_selected_knowledge_id(): void {

    if (!this.mindMap) {
      return;
    }

    this.selected_node = this.mindMap.get_selected_node();
    if (!this.selected_node) {
      this.selected_node_id = '';
    } else {
      this.selected_node_id = this.selected_node.id;
    }
    this.selectNodeEvent.emit(this.selected_node_id); // 向上发射选中节点事件

    window.sessionStorage.setItem('node_id', this.selected_node_id);
  }

  // 如果双击画布且选中了节点，则认为已经更改内容
  updateDblClkChangedStatus() {
    if (!this.mindMap) {
      return;
    }

    if (this.selected_node_id === '' || this.accuracyMode) {
      return;
    }

    this.isChanged = true;
    this.modifyContentEvent.emit(this.isChanged);
  }

  // 保存思维导图到服务器
  save() {
    const mindJson = this.mindMap.get_data(); // 格式同 const mind
    console.log(mindJson);

    const str = jsMind.util.json.json2string(mindJson); // 最终要传输的字符串

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

  json2string(jsonObj: any): any {
    return jsMind.util.json.json2string(jsonObj);
  }

  enterAccuracyMode() {
    this.mindmapService.getMindmap(this.course_id, this.mindmap_id).subscribe(mindStr => {

      this.mindStr = mindStr;
      if (!this.mindMap) {
        this.mindMap = jsMind.show(options, this.mindStr);
      } else {
        this.mindMap.show(this.mindStr);
      }

      this.showAccuracyMap();

    });
  }

  exitAccuracyMode() {
    this.mindMap.enable_edit();
    this.updateMindmapView();
  }

  showAccuracyMap() {
    this.mindmapService.getAccuracy(this.course_id, this.mindmap_id).subscribe(
      r => {
        // todo 遍历每个节点改变颜色
        for (const a of r) {

          if (a['score'] === 0) {
            this.mindMap.set_node_color(a['node_id'], '#F5F5DC', '#000');
          } else {
            const color = this.accuracy2ColorHex(Number.parseFloat(a['value']));
            this.mindMap.set_node_color(a['node_id'], color, '#fff');
          }

        }

        this.mindMap.disable_edit();
      }
    );
  }

  accuracy2ColorHex(accuracy: number) {
    let r = 255, g = 0;
    if (accuracy - 0.5 < 0) {
      g = 255 * 2 * accuracy;
    } else {
      g = 255;
      r = 255 - 255 * 2 * (accuracy - 0.5);
    }

    return this.colorService.rgbaToHex(new Rgba(r, g, 0, 0));

  }

  switchShowBarCharts() {
    if (this.showBarCharts) {
      this.showBarCharts = false;
      return;
    }

    this.mindmapService.getAccuracy(this.course_id, this.mindmap_id).subscribe(r => {

      const topicList = r.map(a => a['node_topic']);
      const accuracyList = r.map(a => Number.parseFloat(a['value']));
      this.chartOption = {
        title: {
          text: '知识点答题准确率'
        },
        xAxis: {
          type: 'value',
          name: '准确率'
        },
        yAxis: {
          type: 'category',
          data: topicList,
          name: '知识点名称',
          axisLabel: {
            interval: 0
          },
        },
        series: [
          {
            data: accuracyList,
            type: 'bar'
          }]
      };
      this.showBarCharts = true;
    });
  }
}
