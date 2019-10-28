import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {QueryObject} from '../../../base';
import {AgentVersionService, AgentVersionInventory} from '../../../shared/sdwan';

@Component({
  selector: 'app-ce-agent-version-add',
  templateUrl: './ce-agent-version-add.component.html',
  styleUrls: ['./ce-agent-version-add.component.styl']
})
export class CeAgentVersionAddComponent implements OnInit {
  @Output()
  done: EventEmitter<AgentVersionInventory> = new EventEmitter<AgentVersionInventory>();
  createAgentVersionForm: FormGroup;
  dialogOptions = {
    title: '创建Agent版本',
    width: '500px',
    visible: false
  };
  constructor(
    private fb: FormBuilder,
    private versionService: AgentVersionService) { }

  ngOnInit() {
    this.createForm();
  }
  openDialog() {
    this.dialogOptions.visible = true;
    this.resetForm();
  }
  createForm() {
    this.createAgentVersionForm = this.fb.group({
      version: ['', [Validators.required]],
      url: ['', Validators.required],
      description: ['']
    });
  }
  resetForm() {
    this.createAgentVersionForm.reset({
      version: '',
      url: '',
      description: ''
    });
  }
  cancel() {
    this.dialogOptions.visible = false;
  }
  get version() {
    return this.createAgentVersionForm.get('version');
  }
  get url() {
    return this.createAgentVersionForm.get('url');
  }
  get description() {
    return this.createAgentVersionForm.get('description');
  }
  confirm() {
    const versionInv = new AgentVersionInventory();
    versionInv.version = this.version.value;
    versionInv.url = this.url.value;
    versionInv.description = this.description.value;
    this.done.emit(versionInv);
    this.dialogOptions.visible = false;
  }
}
