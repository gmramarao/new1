import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitefriendsComponent } from './invitefriends.component';

describe('InvitefriendsComponent', () => {
  let component: InvitefriendsComponent;
  let fixture: ComponentFixture<InvitefriendsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvitefriendsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvitefriendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
