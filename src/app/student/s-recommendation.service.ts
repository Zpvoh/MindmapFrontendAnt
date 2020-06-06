import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SRecommendationService {

  private baseUrl = '';

  tempUrl: string;

  constructor(
    private http: HttpClient
  ) {
    this.baseUrl = environment.apiUrl;
  }

  // 获取推荐列表json
  getRecommendation(course_id: string, graph_id: string, student_name: string): Observable<any> {
    this.tempUrl = this.baseUrl + 'recommendation/' + course_id + '/' + graph_id + '/' + student_name;
    return this.http.get<any>(this.tempUrl);
  }

  getColor(t_arg: number): string {
    const r1 = 225, g1 = 238, b1 = 195, r0 = 240, g0 = 80, b0 = 83;
    const r = r0 * t_arg + r1 * (1 - t_arg);
    const g = g0 * t_arg + g1 * (1 - t_arg);
    const b = b0 * t_arg + b1 * (1 - t_arg);
    return 'rgba(' + r + ',' + g + ',' + b + ',1)';
  }
}
