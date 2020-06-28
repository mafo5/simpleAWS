import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';

import * as __ from 'hamjest';
import * as ___ from 'hamjest-sinon';
import { FormsModule } from '@angular/forms';
import { BackendService } from './backend.service';
import { stub, SinonSub } from 'sinon';
import { of, EMPTY } from 'rxjs';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let compiled: HTMLElement;
  let service: {
    getList: SinonSub,
    postEntry: SinonSub,
    putEntry: SinonSub,
    getEntry: SinonSub,
    deleteEntry: SinonSub,
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
      ],
      declarations: [
        AppComponent
      ],
      providers: [
        { provide: BackendService, useValue: {
          getList: stub().returns(EMPTY),
          postEntry: stub().resolves(),
          putEntry: stub().resolves(),
          getEntry: stub().returns(EMPTY),
          deleteEntry: stub().resolves(),
        } }
      ]
    }).compileComponents();

    service = TestBed.get(BackendService);

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;

    fixture.detectChanges();
  }));

  it('should create the app', () => {

    __.assertThat(component, __.is(__.truthy()));
  });

  it(`should have as title 'client'`, () => {

    __.assertThat(component, __.hasProperty('title', __.is('client')));
  });

  describe('list', () => {
    it('should display list headline', () => {

      __.assertThat(compiled, __.hasProperty('innerText', __.allOf(
        __.containsString('List refresh')
      )));
    });

    describe('with entries', () => {
      beforeEach(() => {
        service.getList.returns(of([
          { id: '1234', text: 'some text' },
        ]));
        component.ngOnInit();
        fixture.detectChanges();
      });

      it('should display entry', () => {

        __.assertThat(compiled, __.hasProperty('innerText', __.allOf(
          __.containsString('some text remove')
        )));
      });

      it('should refresh display entry on click of refresh', () => {
        service.getList.returns(of([
          { id: '1234', text: 'changed text' },
        ]));
        const refreshButton = Array.from(compiled.querySelectorAll('button')).find((entry) => entry.innerText === 'refresh');

        refreshButton.click();
        fixture.detectChanges();

        __.assertThat(compiled, __.hasProperty('innerText', __.allOf(
          __.containsString('changed text remove')
        )));
      });

      it('should call delete Entry when clicked on remove', () => {
        const refreshButton = Array.from(compiled.querySelectorAll('button')).find((entry) => entry.innerText === 'remove');

        refreshButton.click();
        fixture.detectChanges();

        __.assertThat(service, __.hasProperties({
          deleteEntry: ___.wasCalledWith(
            { id: '1234', text: 'some text' },
          ),
          getList: ___.wasCalled(),
        }));
      });
    });
  });

  describe('input', () => {
    it('should display elements', () => {

      __.assertThat(compiled, __.allOf(
        __.hasProperty('innerHTML', __.allOf(
          __.containsString('input'),
        )),
        __.hasProperty('innerText', __.allOf(
          __.containsString('Submit'),
        )),
      ));
    });

    it('should send input to service', () => {
      const inputElement: HTMLInputElement = compiled.querySelector('input');
      const submitButton = Array.from(compiled.querySelectorAll('button')).find((entry) => entry.innerText === 'Submit');

      inputElement.value = 'input text';
      inputElement.dispatchEvent(new Event('input'));
      submitButton.click();

      __.assertThat(service, __.hasProperties({
        postEntry: ___.wasCalledWith('input text'),
        getList: ___.wasCalled(),
      }));
    });

    it('should display element selected from list', async(() => {
      service.getList.returns(of([
        { id: '1234', text: 'some text' },
      ]));
      service.getEntry.withArgs('1234').returns(of(
        { id: '1234', text: 'loaded text' },
      ));
      component.ngOnInit();
      fixture.detectChanges();
      const listElement: HTMLElement = compiled.querySelector('li');

      listElement.click();
      return fixture.whenStable().then(() => {
        fixture.detectChanges();

        __.assertThat(component, __.hasProperty('model', __.hasProperties(
          { id: '1234', text: 'loaded text' },
        )));
      });
    }));
  });
});
