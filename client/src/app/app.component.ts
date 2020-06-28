import { Component, OnInit } from '@angular/core';
import { Observable, EMPTY } from 'rxjs';
import { BackendService, Entry } from './backend.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'client';
  model: Entry = { id: undefined, text: undefined };

  list: Observable<any> = EMPTY;

  constructor(private service: BackendService) {
  }

  ngOnInit() {
    this.refreshList();
  }

  createEntry() {
    let promise;
    if (this.model && this.model.id) {
      promise = this.service.putEntry(this.model);
    } else {
      promise = this.service.postEntry(this.model.text);
    }
    this.model = { id: undefined, text: undefined };
    promise.then(() => {
      this.refreshList();
    });
  }

  editEntry(item: Entry) {
    this.service.getEntry(item.id).subscribe((entry) => {
      this.model = entry;
    });
  }

  refreshList() {
    this.list = this.service.getList();
  }

  removeEntry(item: Entry) {
    this.service.deleteEntry(item).then(() => {
      this.refreshList();
    });
  }
}
