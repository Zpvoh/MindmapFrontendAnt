import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import * as jsMind from '../../../assets/jsmind/jsmind';
import {SMindmapService} from '../s-mindmap.service';

const options = {
  container: 'jsmind_container',
  theme: 'greensea',
  editable: true
};


@Component({
  selector: 'app-s-mindmap',
  templateUrl: './s-mindmap.component.html',
  styleUrls: ['./s-mindmap.component.css']
})
export class SMindmapComponent implements OnInit {

  course_id: string; // 课程id
  @Input()
  set courseId(course_id: string) {
    this.course_id = course_id;
  }

  mindmap_id: string; // 本体图id
  @Input()
  set mindmapId(mindmap_id: string) {
    this.mindmap_id = mindmap_id;

    if (this.mindmap_id) {
      this.updateMindmapView();
      this.updateMindmapNodeCount();
    }
  }

  mindJson: any; // 本体图Json数据

  public mindMap; // 本体图组件

  selected_node_id: string; // 当前本体图中被选中的节点
  @Output() selectNodeEvent = new EventEmitter<string>();
  selected_node;

  modeValue = 'homework';
  mindmap_node_count: any; // 本体图资源数量，包括作业、课件、资源

  constructor(
    private mindmapService: SMindmapService
  ) { }

  ngOnInit() {
    this.selected_node_id = '';
  }

  // 显示新的mindMap
  updateMindmapView() {

    this.mindmapService.getMindmap(this.course_id, this.mindmap_id).subscribe(mindJson => {

      this.mindJson = mindJson;

      if (!this.mindMap) {
        this.mindMap = jsMind.show(options, this.mindJson);
        this.mindMap.disable_edit();
      } else {
        this.mindMap.show(this.mindJson);
      }

    });
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

  screen_shot() {
    this.mindMap.screenshot.shootDownload();
  }

  updateMindmapNodeCount() {
    this.mindmapService.getMindmapNodeCount(this.mindmap_id).subscribe(
      r => {
        this.mindmap_node_count = r;
        this.switchMode();
      }
    );
  }

  switchMode() {

    window.setTimeout(() => {

      this.mindMap.enable_edit();
      for (const c of this.mindmap_node_count) {
        // console.log(c);
        this.mindMap.update_node(c['nodeId'], c['nodeTopic'] + '(' + c[`${this.modeValue}Num`] + ')');
      }
      this.mindMap.disable_edit();
    }, 100);
  }

}
