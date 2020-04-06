import {Component, OnInit, ViewChild} from '@angular/core';

import {Mindmap} from '../../mindmap';
import {NzModalService} from 'ng-zorro-antd';
import {ActivatedRoute, Router} from '@angular/router';
import {SMindmapComponent} from '../s-mindmap/s-mindmap.component';
import {SMindmapCytoComponent} from '../s-mindmap-cyto/s-mindmap-cyto.component';
import {SResourceComponent} from '../s-resource/s-resource.component';
import {SCoursewareComponent} from '../s-courseware/s-courseware.component';
import {SHomeworkComponent} from '../s-homework/s-homework.component';
import {SMindmapService} from '../s-mindmap.service';

@Component({
  selector: 'app-s-course',
  templateUrl: './s-course.component.html',
  styleUrls: ['./s-course.component.css']
})
export class SCourseComponent implements OnInit {
  @ViewChild(SMindmapComponent)
  mindmapComponent: SMindmapComponent;

  @ViewChild(SMindmapCytoComponent)
  mindmapCytoComponent: SMindmapCytoComponent;

  @ViewChild(SHomeworkComponent)
  private homeworkComponent: SHomeworkComponent;

  @ViewChild(SResourceComponent)
  private resourceComponent: SResourceComponent;

  @ViewChild(SCoursewareComponent)
  private coursewareComponent: SCoursewareComponent;

  course_id = ''; // 当前课程id

  mindmapList: Mindmap[] = [
    {'id': 'ics', 'name': '深入理解计算机系统'},
    {'id': 'os', 'name': '操作系统'},
  ]; // 思维导图列表
  currentMindmap: Mindmap = null; // 当前思维导图的对象

  selected_node_id = ''; // 下层组件中选中节点的id

  selectedIndex = 0;
  tabsName = ['思维导图', '作业', '资源', '课件'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mindmapService: SMindmapService,
    private modalService: NzModalService
  ) {

  }

  ngOnInit() {
    this.course_id = this.route.snapshot.paramMap.get('id');

    this.mindmapService.getMindmapList(this.course_id).subscribe(list => {

      this.mindmapList = Array.from(list);
      if (this.mindmapList.length > 0) {
        this.currentMindmap = this.mindmapList[0];
      }

    });
  }

  // 切换思维导图
  switchMindmap(mindmap: any) {

    this.currentMindmap = mindmap;

    this.selectedIndex = 0;
    this.mindmapComponent.selected_node = null;
    this.selected_node_id = '';
  }

  onSelectedNodeChanged(selected_node_id) {
    this.selected_node_id = selected_node_id;
  }

  // 更新资源、作业、课件
  updateData() {
    // this.homeworkComponent.updateHomework();
    // this.resourceComponent.updateResources();
    // this.coursewareComponent.updateCoursewares();
  }

}
