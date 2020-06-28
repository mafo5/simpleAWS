import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

export interface Entry {
  id: string;
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private httpClient: HttpClient) { }

  getList(): Observable<Entry[]> {
    return this.httpClient.get('/api/entries').pipe(
      map((response) => response as Entry[]),
    );
  }

  getEntry(id: string): Observable<Entry> {
    return this.httpClient.get(`/api/entries/${id}`).pipe(
      map((response) => response as Entry),
    );
  }

  postEntry(text: string): Promise<any> {
    return this.httpClient.post(`/api/entries`, {
      id: uuidv4(),
      text,
    }).toPromise();
  }

  putEntry(entry: Entry): Promise<any> {
    return this.httpClient.put(`/api/entries/${entry.id}`, entry).toPromise();
  }

  deleteEntry(entry: Entry): Promise<any> {
    return this.httpClient.delete(`/api/entries/${entry.id}`).toPromise();
  }
}
