import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {Mindmap} from '../mindmap';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SGraphService {

  private baseUrl = '';

  tempUrl: string;

  constructor(
    private http: HttpClient
  ) {
    this.baseUrl = environment.apiUrl;
  }

  // 获取思维导图列表
  getMindmapList(course_id: string): Observable<Mindmap[]> {
    this.tempUrl = this.baseUrl + 'graph_id_list/' + course_id;
    return this.http.get<any>(this.tempUrl);
  }

  // 获取思维导图有的json对象
  getMindmap(course_id: string, mind_id: string): Observable<any> {
    this.tempUrl = this.baseUrl + 'graph/' + course_id + '/' + mind_id;
    return this.http.get<any>(this.tempUrl);
  }

  // 获取思维导图资源数量，包括作业、课件、资源
  getMindmapNodeCount(mind_id: string): Observable<any> {
    this.tempUrl = this.baseUrl + 'graph_node_count/' + mind_id;
    return this.http.get<any>(this.tempUrl);
  }

}
