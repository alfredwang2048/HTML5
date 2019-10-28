import {Component, EventEmitter, OnInit, Output, Input} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {QueryObject} from '../../../base';
import {AgentVersionInventory} from '../../../shared/sdwan';

@Component({
  selector: 'app-ce-agent-version-update',
  templateUrl: './ce-agent-version-update.component.html',
  styleUrls: ['./ce-agent-version-update.component.styl']
})
export class CeAgentVersionUpdateComponent implements OnInit {
  @Input()
  selectedAgentVersion: AgentVersionInventory;
  @Output()
  done: EventEmitter<AgentVersionInventory> = new EventEmitter<AgentVersionInventory>();
  updateAgentVersionForm: FormGroup;
  dialogOptions = {
    title: '修改Agent版本',
    width: '500px',
    visible: false
  };
  constructor(private fb: FormBuilder) { }
  ngOnInit() {
    this.createForm();
  }
  open() {
    this.dialogOptions.visible = true;
    this.resetForm();
  }
  createForm() {
    this.updateAgentVersionForm = this.fb.group({
      version: ['', [Validators.required]],
      url: ['', Validators.required],
      description: ['']
    });
  }
  resetForm() {
    this.updateAgentVersionForm.reset({
      version: this.selectedAgentVersion.version,
      url: this.selectedAgentVersion.url,
      description: this.selectedAgentVersion.description
    });
  }
  cancel() {
    this.dialogOptions.visible = false;
  }
  get version() {
    return this.updateAgentVersionForm.get('version');
  }
  get url() {
    return this.updateAgentVersionForm.get('url');
  }
  get description() {
    return this.updateAgentVersionForm.get('description');
  }
  confirm() {
    const versionInv = new AgentVersionInventory();
    versionInv.uuid = this.selectedAgentVersion.uuid;
    versionInv.version = this.version.value;
    versionInv.url = this.url.value;
    versionInv.description = this.description.value;
    this.done.emit(versionInv);
    this.dialogOptions.visible = false;
  }

}
