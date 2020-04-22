import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';
import {MultipleQuestion} from './multiple-question';
import {ShortQuestion} from './short-question';
import {Link} from '../link';
import {JudgeQuestion} from './judge-question';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root'
})
export class TNodeService {
  private baseUrl = '';
  tempUrl: string;

  constructor(
    private http: HttpClient
  ) {
    this.baseUrl = environment.apiUrl;
  }

  // 教师获取选择题列表
  getMultiple(course_id: string, mindmap_id: string, node_id: string): Observable<MultipleQuestion[]> {
    this.tempUrl = this.baseUrl + 'multiples_teacher/' + course_id + '/' + mindmap_id + '/' + node_id;
    return this.http.get<MultipleQuestion[]>(this.tempUrl);
  }

  // 教师&学生获取简答题列表
  getShort(course_id: string, mindmap_id: string, node_id: string): Observable<any[]> {
    this.tempUrl = this.baseUrl + 'shorts/' + course_id + '/' + mindmap_id + '/' + node_id;
    return this.http.get<ShortQuestion[]>(this.tempUrl);
  }

  // 教师获取判断题列表
  getJudge(course_id: string, mindmap_id: string, node_id: string): Observable<JudgeQuestion[]> {
    this.tempUrl = this.baseUrl + 'judgments_teacher/' + course_id + '/' + mindmap_id + '/' + node_id;
    return this.http.get<JudgeQuestion[]>(this.tempUrl);
  }

  // 教师删除选择题列表
  deleteMultiple(assignment_id: number): Observable<boolean> {
    this.tempUrl = this.baseUrl + 'delete_multiple/' + assignment_id;
    return this.http.get<boolean>(this.tempUrl);
  }

  // 教师删除简答题列表
  deleteShort(assignment_id: number): Observable<boolean> {
    this.tempUrl = this.baseUrl + 'delete_short/' + assignment_id;
    return this.http.get<boolean>(this.tempUrl);
  }

  // 教师删除判断题列表
  deleteJudge(assignment_id: number): Observable<boolean> {
    this.tempUrl = this.baseUrl + 'delete_judge/' + assignment_id;
    return this.http.get<boolean>(this.tempUrl);
  }

  // 教师发布选择题
  releaseMutiple(course_id: string, mindmap_id: string, node_id: string, multiple: MultipleQuestion): Observable<boolean> {
    this.tempUrl = this.baseUrl + 'release_multiple/' + course_id + '/' + mindmap_id + '/' + node_id;
    return this.http.post<boolean>(this.tempUrl, multiple, httpOptions);
  }

  // 教师发布简答题
  releaseShort(course_id: string, mindmap_id: string, node_id: string, short: ShortQuestion): Observable<boolean> {
    this.tempUrl = this.baseUrl + 'release_short/' + course_id + '/' + mindmap_id + '/' + node_id;
    return this.http.post<boolean>(this.tempUrl, short, httpOptions);
  }

  // 教师批改简答题
  correctShort(assignment_long_id: string, student_id: string, score: number): Observable<boolean>{
    this.tempUrl = this.baseUrl + 'correct_short/' + assignment_long_id + '/' + student_id;
    return this.http.post<boolean>(this.tempUrl, score);
  }

  // 教师发布判断题
  releaseJudge(course_id: string, mindmap_id: string, node_id: string, judge: JudgeQuestion): Observable<boolean> {
    this.tempUrl = this.baseUrl + 'release_judgement/' + course_id + '/' + mindmap_id + '/' + node_id;
    return this.http.post<boolean>(this.tempUrl, judge, httpOptions);
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

  upload_link(course_id: string, mind_id: string, node_id: string, link: Link): Observable<boolean> {
    this.tempUrl = this.baseUrl + 'upload_link/' + course_id + '/' + mind_id + '/' + node_id;
    return this.http.post<boolean>(this.tempUrl, link, httpOptions);
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

  removeCourseware(course_id: string, mind_id: string, node_id: string, courseware_name: string) {
    this.tempUrl = this.baseUrl + 'delete_courseware/' + course_id + '/' + mind_id + '/' + node_id + '/' + courseware_name;
    return this.http.delete<any>(this.tempUrl, httpOptions);
  }

  removeMaterial(course_id: string, mind_id: string, node_id: string, material_name: string) {
    this.tempUrl = this.baseUrl + 'delete_material/' + course_id + '/' + mind_id + '/' + node_id + '/' + material_name;
    return this.http.delete<any>(this.tempUrl, httpOptions);
  }

  removeLink(link_name: string, nodeId: string) {
    this.tempUrl = this.baseUrl + 'delete_link/' + link_name + '/' + nodeId;
    return this.http.delete<any>(this.tempUrl, httpOptions);
  }
}
