import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Profile } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);

  get(username: string): Observable<Profile> {
    return this.http
      .get<{ profile: Profile }>(
        `${environment.apiUrl}/profiles/${username}`,
      )
      .pipe(map(({ profile }) => profile));
  }

  follow(username: string): Observable<Profile> {
    return this.http
      .post<{ profile: Profile }>(
        `${environment.apiUrl}/profiles/${username}/follow`,
        {},
      )
      .pipe(map(({ profile }) => profile));
  }

  unfollow(username: string): Observable<Profile> {
    return this.http
      .delete<{ profile: Profile }>(
        `${environment.apiUrl}/profiles/${username}/follow`,
      )
      .pipe(map(({ profile }) => profile));
  }
}
