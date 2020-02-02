import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';

import { TeacherRoutingModule } from './teacher-routing.module';
import { TCoursesComponent } from './t-courses/t-courses.component';
import { TMainComponent } from './t-main/t-main.component';
import { TCourseComponent } from './t-course/t-course.component';
import { TMindmapComponent } from './t-mindmap/t-mindmap.component';
import { THomeworkComponent } from './t-homework/t-homework.component';
import { TResourceComponent } from './t-resource/t-resource.component';
import { TCoursewareComponent } from './t-courseware/t-courseware.component';

import { NgZorroAntdModule } from 'ng-zorro-antd';
import { ColorPickerModule } from 'ngx-color-picker';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgxEchartsModule } from 'ngx-echarts';
import { TMindmapCytoComponent } from './t-mindmap-cyto/t-mindmap-cyto.component';

@NgModule({
  declarations: [
    TCoursesComponent,
    TMainComponent,
    TCourseComponent,
    TMindmapComponent,
    THomeworkComponent,
    TResourceComponent,
    TCoursewareComponent,
    TMindmapCytoComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgZorroAntdModule,
    TeacherRoutingModule,
    ColorPickerModule,
    PdfViewerModule,
    NgxEchartsModule
  ]
})
export class TeacherModule { }
