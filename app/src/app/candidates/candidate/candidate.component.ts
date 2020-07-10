import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Candidate } from 'src/app/model-interfaces/candidate';
import { APIService } from 'src/app/api/api.service';
import { toggleDisabledInputsAndSelect, propertiesInputAngularInvalid } from 'src/app/utils/utils';
import { CandidateJobOpportunity } from 'src/app/model-interfaces/candidate-job-opportunity';
import { JobOpportunity } from 'src/app/model-interfaces/job-opportunity';
import { User } from 'src/app/model-interfaces/user';
import { NotifierService } from 'src/app/notifier/notifier.service';

interface TextNewCurriculum { Show: string, Hide: string };
const TXT_NEW_CURRICULUM: TextNewCurriculum = { Show: 'Anexar Currículo', Hide: 'Ocultar' };
let jobOpportunities: JobOpportunity[] = [];

@Component({
	selector: 'app-candidate',
	templateUrl: './candidate.component.html',
	styleUrls: ['./candidate.component.css']
})
export class CandidateComponent implements OnInit {

	@Input() candidate: Candidate;
	@Output() candidateRemoved = new EventEmitter<null>();

	panelOpenState: boolean = false;
	uploadCandidate = false;
	newLink: string = '';
	showUploadFile = false;
	hasCurriculum = true;
	curriculumActions: string[] = ['download', 'delete'];
	thereAreJobOpportunitiesToAssociate: boolean;
	textCurriculum = 'Anexar Currículo';

	

	constructor(
		private apiService: APIService,
		private notifierService: NotifierService ) { }

	ngOnInit(): void {
		propertiesInputAngularInvalid('CandidateComponent', this.candidate);
		this.hasCurriculum = this.candidate.hasResume;
		debugger
		if (!jobOpportunities.length){
			this.apiService.get.job_opportunities().subscribe(
				(jobs: JobOpportunity[]) => {
					jobOpportunities = jobs;
					this.updatePropJobOpportunitiesToAssociate();
				},
				error => console.error(error)
			);
		}
		this.updatePropJobOpportunitiesToAssociate();
	}

	delete() {
		this.apiService.delete.candidate(this.candidate._id).subscribe(
			response => {
				if (response.status === 204) {
					this.notifierService.success('Candidato Desativado com Sucesso');
					this.candidateRemoved.emit();
				}
			},
			error => console.warn(error)
		);
	}
	edit() {
		toggleDisabledInputsAndSelect(this.candidate._id);
		this.uploadCandidate = true;
	}
	update() {
		this.apiService.update.candidate(this.candidate).subscribe(
			(candidateUpdated: Candidate) => {
				this.notifierService.success('Candidato Atualizado com Sucesso')
				toggleDisabledInputsAndSelect(candidateUpdated._id);
				this.uploadCandidate = false;
			},
			error => console.log(error)
		);
	}

	addLinkToCandidate = () => {
		if (this.newLink && !this.candidate.links.includes(this.newLink)) {
			this.candidate.links.push(this.newLink);
			this.newLink = '';
		}
	}
	removeLinkOfCandidate = (url: string) => {
		this.candidate.links = this.candidate.links.filter(link => link !== url);
	}

	toggleUploadFileContainer = () => {
		this.textCurriculum = this.textCurriculum === TXT_NEW_CURRICULUM.Show ? TXT_NEW_CURRICULUM.Hide : TXT_NEW_CURRICULUM.Show;
		this.showUploadFile = !this.showUploadFile;		
	}

	curriculumClicked = (action: 'download' | 'delete') => {
		if (action === 'download') {
			this.apiService.get.candidate_curriculum(this.candidate._id).subscribe(
				curriculum => {
					this.notifierService.success("Download do Currículo do Candidato Concluído.");
					const url = window.URL.createObjectURL(new Blob([curriculum as BlobPart], { type: 'application/pdf' }));
					var link = document.createElement('a');
					document.body.appendChild(link);
					link.setAttribute('style', 'display: none');
					link.href = url;
					link.download = `Curriculo-${this.candidate.name}.pdf`;
					link.click();
				},
				error => console.error(error)
			);
		}
		else this.apiService.delete.candidate_curriculum(this.candidate._id).subscribe(
			response => {
				if (response.status === 204) {
					this.notifierService.success('Currículo Excluído com Sucesso');
					this.hasCurriculum = false;
				}
			},
			error => console.error(error)
		);
	}

	curriculumAdded = (result: boolean) => this.hasCurriculum = result;

	newAssociatedJobs = (newData: CandidateJobOpportunity[]) => {
		this.candidate.jobOpportunities = newData;
		this.updatePropJobOpportunitiesToAssociate();
	}

	disassociateJob = (associateId: string) => {
		this.apiService.disassociate_candidate_with_job_opportunity(associateId).subscribe(
			response => {
				if (response.status === 204) {
					this.notifierService.success('Vaga de Trabalho Desvinculada com Sucesso');
					this.thereAreJobOpportunitiesToAssociate = true;
					this.candidate.jobOpportunities = this.candidate.jobOpportunities.filter(associate => associate._id !== associateId);
				}
			},
			error => console.error(error)
		);
	}

	updatePropJobOpportunitiesToAssociate = () => {
		debugger
		this.thereAreJobOpportunitiesToAssociate = this.candidate.jobOpportunities.length < jobOpportunities.length;
	}

}
