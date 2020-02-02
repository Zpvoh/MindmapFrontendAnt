import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NgZorroAntdModule } from 'ng-zorro-antd';
import { StudentRoutingModule } from './student-routing.module';
import { SCoursesComponent } from './s-courses/s-courses.component';
import { SMainComponent } from './s-main/s-main.component';
import { SCourseComponent } from './s-course/s-course.component';
import { SMindmapComponent } from './s-mindmap/s-mindmap.component';
import { SResourceComponent } from './s-resource/s-resource.component';
import { SCoursewareComponent } from './s-courseware/s-courseware.component';
import { SHomeworkComponent } from './s-homework/s-homework.component';

import { PdfViewerModule } from 'ng2-pdf-viewer';
import { SLearningSituationComponent } from './s-learning-situation/s-learning-situation.component';

@NgModule({
  declarations: [
    SCoursesComponent,
    SMainComponent,
    SCourseComponent,
    SMindmapComponent,
    SResourceComponent,
    SCoursewareComponent,
    SHomeworkComponent,
    SLearningSituationComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgZorroAntdModule,
    StudentRoutingModule,
    PdfViewerModule
  ]
})
export class StudentModule { }
