import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilModificationComponent } from './profil-modification.component';

describe('ProfilModificationComponent', () => {
  let component: ProfilModificationComponent;
  let fixture: ComponentFixture<ProfilModificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfilModificationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfilModificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
