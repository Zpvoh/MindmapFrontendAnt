import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Mindmap } from '../../mindmap';
import {TMindmapService} from '../t-mindmap.service';
import {TMindmapComponent} from '../t-mindmap/t-mindmap.component';
import {NzModalRef, NzModalService} from 'ng-zorro-antd';
import {THomeworkComponent} from '../t-homework/t-homework.component';
import {TResourceComponent} from '../t-resource/t-resource.component';
import {TCoursewareComponent} from '../t-courseware/t-courseware.component';
import {TCourseService} from '../t-course.service';
import {TMindmapCytoComponent} from '../t-mindmap-cyto/t-mindmap-cyto.component';

@Component({
  selector: 'app-t-course',
  templateUrl: './t-course.component.html',
  styleUrls: ['./t-course.component.css']
})
export class TCourseComponent implements OnInit {

  // @ViewChild(TMindmapComponent)
  // mindmapComponent: TMindmapComponent;

  @ViewChild(TMindmapCytoComponent)
  mindmapComponent: TMindmapCytoComponent;

  @ViewChild(THomeworkComponent)
  private homeworkComponent: THomeworkComponent;

  @ViewChild(TResourceComponent)
  private resourceComponent: TResourceComponent;

  @ViewChild(TCoursewareComponent)
  private coursewareComponent: TCoursewareComponent;

  course_id = ''; // 当前课程id

  studentList: string[];

  mindmapList: Mindmap[] = [
    {'id': 'ics', 'name': '深入理解计算机系统'},
    {'id': 'os', 'name': '操作系统'},
  ]; // 思维导图列表
  currentMindmap: Mindmap = null; // 当前思维导图的对象

  selected_node_id = ''; // 下层组件中选中节点的id
  isChanged; // 下层组件中内容是否改变

  switchToAccuracyMode = false; // 切换到准确率模式

  tplModal: NzModalRef; // 用于创建新的思维导图
  newMindmapName = '';
  newMindJson = {
    'meta' : {
      'name': '',
      'author': 'user',
      'version': '0.2'
    },
    /* 数据格式声明 */
    'format': 'node_tree',
    /* 数据内容 */

    'data': {
      'id': 'root',
      'topic': '* 根节点 *',
      'expanded': true
    }
  }; // 用作创建新思维导图时填充

  selectedIndex = 0; // tab序号
  tabsName = ['思维导图', '作业', '资源', '课件']; // tab名称

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mindmapService: TMindmapService,
    private modalService: NzModalService,
    private courseService: TCourseService
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

    this.courseService.getStudents(this.course_id).subscribe(list => {
      this.studentList = list;
    });
  }

  // 提示保存原来的思维导图
  promptSave() {
    return this.modalService.confirm({
      nzTitle     : '是否保存对当前思维导图的修改？',
      nzContent   : '<b style="color: red;">如果不保存，会丢失所有更改</b>',
      nzOkText    : '是',
      nzOkType    : 'primary',
      nzOnOk      : () => this.mindmapComponent.save(),
      nzCancelText: '否',
      nzOnCancel  : () => {
        this.isChanged = false;
      }
    });
  }

  // 切换思维导图
  switchMindmap(mindmap: any) {
    if (this.isChanged) {
      this.promptSave().afterClose.subscribe(
        () => {
          this.currentMindmap = mindmap;
        });
    } else {
      this.currentMindmap = mindmap;
    }

    this.selectedIndex = 0;
    this.mindmapComponent.selected_node = null;
    this.selected_node_id = '';
  }

  // 创建思维导图
  checkAndCreate() {
    for (const m of this.mindmapList) {
      if (m.name === this.newMindmapName) {
        const inModal = this.modalService.warning(
          {
            nzTitle: '请重新填写思维导图名称',
            nzContent: '不可与已有的重复'
          });
        return;
      }
    }

    // 参考jsmind.js里面的方法确定新的思维导图的id
    const newMindmapId = (new Date().getTime().toString(16)
      + Math.random().toString(16).substr(2)).substr(2, 16); // 新的id
    this.newMindJson.meta.name = this.newMindmapName; // 新的名称

    this.mindmapService.createMindmap(
      this.course_id,
      newMindmapId,
      JSON.stringify(this.newMindJson)
    ).subscribe(r => {
      if (r['success']) {
        const new_mind = {'id': newMindmapId, 'name': this.newMindmapName};
        this.mindmapList.push(new_mind);
        this.currentMindmap = new_mind;
        this.newMindmapName = '';

        const inModal = this.modalService.success(
          {
            nzTitle: '创建成功',
            nzContent: '即将进入新的思维导图界面'
          });

        window.setTimeout(
          () => {
            inModal.destroy();
            this.tplModal.destroy();
            },
          2000
        );
      }
    });
  }

  createMindmap(tplTitle: TemplateRef<{}>, tplContent: TemplateRef<{}>, tplFooter: TemplateRef<{}>) {
    if (this.isChanged) {
      this.promptSave().afterClose.subscribe(
        () => this.openModal(tplTitle, tplContent, tplFooter));
    } else {
      this.openModal(tplTitle, tplContent, tplFooter);
    }
  }

  // 监听变量变化
  onMindmapChanged(isChanged: boolean) {
    this.isChanged = isChanged;
  }

  onSelectedNodeChanged(selected_node_id) {
    this.selected_node_id = selected_node_id;
  }

  // 打开创建新思维导图的窗口
  openModal(tplTitle: TemplateRef<{}>, tplContent: TemplateRef<{}>, tplFooter: TemplateRef<{}>) {

    this.tplModal = this.modalService.create({
      nzTitle: tplTitle,
      nzContent: tplContent,
      nzFooter: tplFooter,
      nzMaskClosable: false
    });
  }

  // 更新资源、作业、课件
  updateData() {
    this.homeworkComponent.updateHomework();
    this.resourceComponent.updateResources();
    this.coursewareComponent.updateCoursewares();
  }

  clickSwitch() {
    if (!this.currentMindmap || this.selectedIndex !== 0) {
      return;
    }

    if (!this.switchToAccuracyMode) {
      if (this.isChanged) {
        this.promptSave().afterClose.subscribe(
          () => {
            this.switchToAccuracyMode = true;
            this.mindmapComponent.enterAccuracyMode();
          }
        );
      } else {
        this.switchToAccuracyMode = true;
        this.mindmapComponent.enterAccuracyMode();
      }
    } else {
      this.switchToAccuracyMode = false;
      this.mindmapComponent.exitAccuracyMode();
    }
  }

  deleteMindmap() {
    if (this.currentMindmap === null) {
      return;
    }

    const deleteModal = this.modalService.warning({
      nzTitle     :  `确认删除思维导图${this.currentMindmap.name}吗？`,
      nzContent   : '<b style="color: red;">删除后将无法恢复</b>',
      nzOkText    : '是',
      nzOkType    : 'primary',
      nzOnOk      : () => this.mindmapService.deleteMindmap(this.currentMindmap.id).subscribe(
        r => {
          deleteModal.destroy();
          this.mindmapService.getMindmapList(this.course_id).subscribe(list => {

            this.mindmapList = Array.from(list);
            if (this.mindmapList.length > 0) {
              this.currentMindmap = this.mindmapList[0];
            } else {
              this.currentMindmap = null;
            }

          });
        }),
      nzCancelText: '否',
      nzOnCancel  : () => {
          deleteModal.destroy();
        }
      }
    );

  }

}
