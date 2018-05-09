import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch'

@Injectable()

export class TmdbService {

  API_KEY: String = "API_KEY";

  constructor(private http: Http) { }

  getFilmDetails(id: any, language: any) {
    var url = 'https://api.themoviedb.org/3/movie/' + encodeURI(id) + '?api_key=' + this.API_KEY + '&append_to_response=release_dates,videos,credits' + '&language=' + language;
    // console.log('GET - ' + url);
    var response = this.http.get(url)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    return response;
  }
}
