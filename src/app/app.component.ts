import { Component } from '@angular/core';
import { TmdbService } from './tmdb.service';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer } from '@angular/platform-browser';

import * as moment from 'moment/moment';
import 'moment/locale/es'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [TmdbService]
})

export class AppComponent {

  visible: boolean = false;

  DEFAULT_LANG: string = 'en';
  DEFAULT_COUNTRY: string = 'US';

  id: string;
  lang: string;
  country: string;
  film: any = {};

  constructor(private tmdbService: TmdbService, translate: TranslateService, private sanitizer: DomSanitizer) {
    //http://localhost:4200/?m=313369&l=en&c=ES
    this.id = this.getParameterByName('m', null);
    this.lang = this.getParameterByName('l', null) ? this.getParameterByName('l', null) : this.DEFAULT_LANG;
    this.country = this.getParameterByName('c', null) ? this.getParameterByName('c', null) : this.DEFAULT_COUNTRY;

    moment.locale(this.country.toLowerCase() != 'us' ? 'es' : 'en');
    translate.setDefaultLang(this.DEFAULT_LANG);
    translate.use(this.lang);

    this.tmdbService.getFilmDetails(this.id, this.lang).subscribe(
      data => { this.film = data; this.getDaysLeft(); this.visible = true; },
      err => { console.log(err); }
    );
  }

  getBackdrop() {
    return 'url(https://image.tmdb.org/t/p/w1280' + (this.film.backdrop_path ? this.film.backdrop_path : this.film.poster_path) + ')';
  }

  getRuntime() {
    return this.film.runtime;
  }

  getGenres() {
    if (!this.film.genres) return new Array();

    var genres = new Array();
    for (var i = 0; i < this.film.genres.length; i++) {
      if (this.film.genres[i].name == 'Science Fiction')
        genres.push('Sci-Fi');
      else
        genres.push(this.film.genres[i].name);

      // getting max 2 genres
      if (i == 1) break;
    }

    return genres;
  }

  getReleaseDate() {
    if (!this.film.release_dates) return null;

    var releaseDate = null;

    for (var i = 0; i < this.film.release_dates.results.length; i++)
      if (this.film.release_dates.results[i].iso_3166_1 == this.country)
        for (var j = 0; j < this.film.release_dates.results[i].release_dates.length; j++)
          if (this.film.release_dates.results[i].release_dates[j].type == 3) {
            releaseDate = new Date(this.film.release_dates.results[i].release_dates[j].release_date);
            break;
          }

    if (releaseDate) return moment(releaseDate.toJSON().split('T')[0]).format('L');
    else if (this.film.release_date) return moment(this.film.release_date).format('L');
    else return null;
  }

  getDirector() {
    if (!this.film.credits) return new Array();

    var directors = new Array();
    for (var i = 0; i < this.film.credits.crew.length; i++)
      if (this.film.credits.crew[i].job == 'Director') {
        directors.push(this.film.credits.crew[i]);
        if (directors.length == 2) break;
      }

    return directors;
  }

  getCast() {
    if (!this.film.credits) return new Array();

    var cast = new Array();
    for (var i = 0; i < this.film.credits.cast.length; i++) {
      cast.push(this.film.credits.cast[i]);

      // getting max 5 acting roles
      if (i == 4) break;
    }

    return cast;
  }

  getDaysLeft() {
    var releaseDate = null;

    for (var i = 0; i < this.film.release_dates.results.length; i++)
      if (this.film.release_dates.results[i].iso_3166_1 == this.country)
        for (var j = 0; j < this.film.release_dates.results[i].release_dates.length; j++)
          if (this.film.release_dates.results[i].release_dates[j].type == 3) {
            releaseDate = this.film.release_dates.results[i].release_dates[j].release_date;
            break;
          }

    if (releaseDate == null) {
      if (this.film.release_date == "" || new Date(this.film.release_date) > new Date()) {
        this.film.release_country_days = 999;
      } else {
        this.film.release_country_days = 0;
      }
    } else {
      var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
      var today = new Date();
      var release = new Date(releaseDate);

      today.setHours(0, 0, 0, 0);
      release.setHours(0, 0, 0, 0);

      var diffDays = Math.round((release.getTime() - today.getTime()) / (oneDay));

      this.film.release_country_days = diffDays;
    }
  }

  getTrailer() {
    if (!this.film.videos) return null;

    for (var i = 0; i < this.film.videos.results.length; i++)
      if (this.film.videos.results[i].type == 'Trailer' && this.film.videos.results[i].site == 'YouTube')
        return this.film.videos.results[i].key;

    return null;
  }

  getParameterByName(name: any, url: any) {
    // @ https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  gotoIMDB() {
    return 'http://www.imdb.com/title/' + this.film.imdb_id;
  }

  gotoYouTube() {
    return 'https://www.youtube.com/watch?v=' + this.getTrailer();
  }

  gotoMorfilms() {
    return this.sanitizer.bypassSecurityTrustUrl('morfilms://app/film/' + this.id);
  }

}
