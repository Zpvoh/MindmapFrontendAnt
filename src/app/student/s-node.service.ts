import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { ShortQuestion } from '../teacher/short-question';
import { StuMultiple } from './stu-multiple';
import { StuJudge } from './stu-judge';
import { StuShort } from './stu-short';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root'
})
export class SNodeService {

  private baseUrl = '';
  tempUrl: string;

  constructor(
    private http: HttpClient
  ) {
    this.baseUrl = environment.apiUrl;
  }

  // 学生获取简答题列表
  getShort(course_id: string, mindmap_id: string, node_id: string, stu_name: string): Observable<StuShort[]> {
    this.tempUrl = this.baseUrl + 'shorts_student/' + course_id + '/' + mindmap_id + '/' + node_id + '/' + stu_name;
    return this.http.get<StuShort[]>(this.tempUrl);
  }

  // 学生获取选择题列表
  getStuMultiple(course_id: string, mindmap_id: string, node_id: string, stu_name: string): Observable<StuMultiple[]> {
    this.tempUrl = this.baseUrl + 'multiples_student/' + course_id + '/' + mindmap_id + '/' + node_id + '/' + stu_name;
    return this.http.get<StuMultiple[]>(this.tempUrl);
  }

  // 学生获取判断题列表
  getStuJudge(course_id: string, mindmap_id: string, node_id: string, stu_name: string): Observable<StuJudge[]> {
    this.tempUrl = this.baseUrl + 'judgments_student/' + course_id + '/' + mindmap_id + '/' + node_id + '/' + stu_name;
    return this.http.get<StuJudge[]>(this.tempUrl);
  }

  // 学生回答选择题
  answerMultiple(course_id: string, mindmap_id: string, node_id: string, user_name: string, stuMultiple: StuMultiple): Observable<boolean> {
    this.tempUrl = this.baseUrl + 'answer_multiple/' + course_id + '/' + mindmap_id + '/' + node_id + '/' + user_name;
    return this.http.post<boolean>(this.tempUrl, stuMultiple, httpOptions);
  }

  // 学生回答判断题
  answerShort(course_id: string, mindmap_id: string, node_id: string, user_name: string, stuShort: StuShort): Observable<boolean> {
    this.tempUrl = this.baseUrl + 'answer_short/' + course_id + '/' + mindmap_id + '/' + node_id + '/' + user_name;
    return this.http.post<boolean>(this.tempUrl, stuShort, httpOptions);
  }

  // 学生回答判断题
  answerJudge(course_id: string, mindmap_id: string, node_id: string, user_name: string, stuJudge: StuJudge): Observable<boolean> {
    this.tempUrl = this.baseUrl + 'answer_judgement/' + course_id + '/' + mindmap_id + '/' + node_id + '/' + user_name;
    return this.http.post<boolean>(this.tempUrl, stuJudge, httpOptions);
  }

  // 获取资源列表
  getMaterials(course_id: string, mind_id: string, node_id: string): Observable<string[]> {
    this.tempUrl = this.baseUrl + 'materials/' + course_id + '/' + mind_id + '/' + node_id;
    return this.http.get<string[]>(this.tempUrl);
  }

  // 获取资源列表
  getCoursewares(course_id: string, mind_id: string, node_id: string): Observable<string[]> {
    this.tempUrl = this.baseUrl + 'coursewares/' + course_id + '/' + mind_id + '/' + node_id;
    return this.http.get<string[]>(this.tempUrl);
  }

  getLinks(course_id: string, mind_id: string, node_id: string): Observable<string[]> {
    this.tempUrl = this.baseUrl + 'links/' + course_id + '/' + mind_id + '/' + node_id;
    return this.http.get<string[]>(this.tempUrl);
  }

  requestMaterialBlob(course_id: string, mind_id: string, node_id: string, material_name: string): Observable<any> {
    this.tempUrl = this.baseUrl + 'download_material/' + course_id + '/' + mind_id + '/' + node_id;
    const data = {'material_name': material_name};

    return this.http.request('post', this.tempUrl, { body: data, observe: 'response', responseType: 'blob'});
  }

  // Blob请求
  requestCoursewareBlob(course_id: string, mind_id: string, node_id: string, material_name: string): Observable<any> {
    this.tempUrl = this.baseUrl + 'download_courseware/' + course_id + '/' + mind_id + '/' + node_id;
    const data = {'courseware_name': material_name};

    return this.http.request('post', this.tempUrl, { body: data, observe: 'response', responseType: 'blob'});
  }

  // Blob文件转换下载
  downFile(result, fileName) {

    const data = result.body;
    const blob = new Blob([data], { type: data.type });
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('style', 'display:none');
    a.setAttribute('href', objectUrl);
    a.setAttribute('download', fileName);
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  get_real_answer(longId: string, type: number, user_name: string) {
    this.tempUrl = this.baseUrl + 'student_real_answer/' + longId + '/' + type + '/' + user_name;
    return this.http.get<string[]>(this.tempUrl);
  }
}
