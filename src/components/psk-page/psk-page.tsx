import { Component, h, Prop, Listen, State, Element } from "@stencil/core";
import { BindModel, CustomTheme, NavigationTrackerService, TableOfContentProperty } from "@cardinal/internals";
import { scrollToElement, createCustomEvent } from "@cardinal/internals"; // utils
import { Chapter } from "../../interfaces";
import highlightChapter from "./highlightChapter";

@Component({
	tag: "psk-page",
  styleUrl:"../../assets/css/bootstrap/bootstrap.css",
	shadow: true
})
export class PskPage {
	@CustomTheme()

	@BindModel() modelHandler;

	@Prop({reflect:true}) hasToc: boolean = false;
	@State() activeChapter: string = null;
	@State() chapters: Array<Chapter> = [];
	@Prop() pageClass : string = "";
	@TableOfContentProperty({
		description: `This property is used as the page title`,
		isMandatory: false,
		propertyType: `string`
	})
	@Prop({reflect:true}) title: string = "";
  @TableOfContentProperty({
    description: `This property is used as the page sub-title`,
    isMandatory: false,
    propertyType: `string`
  })

  @Prop() navigationTitle: string = "";
  @TableOfContentProperty({
    description: `This property is used in context of ssapps: when psk-ssapp component is loading another cardinal app that uses psk-page component and wants to notify the parent about the current page`,
    isMandatory: false,
    propertyType: `string`
  })
  @Prop() subTitle: string = "";

	@TableOfContentProperty({
		description: `This property is the name of the table of content.`,
		isMandatory: false,
		propertyType: `string`
	})
	@Prop() tocTitle: string;

  @TableOfContentProperty({
    description: `This property sets the text of the badge.`,
    isMandatory: false,
    propertyType: `string`
  })
  @Prop() badgeText: string;

  @TableOfContentProperty({
    description: `This property sets the color of the badge text.`,
    isMandatory: false,
    propertyType: `string`
  })
  @Prop() badgeTextColor: string;

  @TableOfContentProperty({
    description: `This property sets the background color of the badge.`,
    isMandatory: false,
    propertyType: `string`
  })
  @Prop() badgeBackgroundColor: string;



	@State() componentFullyLoaded: boolean = false;

	@Element() private element: HTMLElement;

	render() {
        if(!this.element.isConnected) return null;

		this.hasToc && this._sendTableOfContentChapters();

		const tableOfContentSlot = (
			<div class="toc" part="page-toc">
				<slot name="toc" />
			</div>
		);

		return (
			<div class={`main-container ${this.pageClass}`} part="page-main">

        {this.badgeText?<div class="psk-badge" style={{backgroundColor:this.badgeBackgroundColor}}>
          <div class="psk-badge-text" style={{color:this.badgeTextColor}}>{this.badgeText}</div>
        </div>:null}

        {this.title ? <div class="page-title"><h1>{this.title}</h1></div> : null}
        {this.subTitle ? <div class="page-subtitle"><h2>{this.subTitle}</h2></div> : null}
				<div class="page-content" part="page-grid">
					{(this.componentFullyLoaded && this.hasToc) && tableOfContentSlot}

					<div class="container" part="page-container">
						{this.componentFullyLoaded ?
              <div class="container-content" part="page-slot-container">
                <slot />
              </div>
							: <psk-ui-loader shouldBeRendered={true} />}
					</div>
				</div>
			</div>
		)
	}

	@Listen("psk-send-chapter")
	receiveChapters(evt: CustomEvent): void {
		evt.stopImmediatePropagation();
		if (!evt.detail) {
			return;
		}
		const newChapter: Chapter = { ...evt.detail };
		const findChapterRule = ((elm: Chapter) => {
			return newChapter.guid === elm.guid;
		});

		const chapterIndex: number = this.chapters.findIndex(findChapterRule);

		const tempChapter: Array<Chapter> = [...this.chapters];
		if (chapterIndex === -1) {
			tempChapter.push({
				...newChapter,
			});
			this.chapters = JSON.parse(JSON.stringify(tempChapter));
			return;
		}

		tempChapter[chapterIndex] = {
			...newChapter,
		};
		this.chapters = JSON.parse(JSON.stringify(tempChapter));
	}

	_checkForChapterScrolling(): void {
		if (window.location.href.indexOf("chapter=") === -1) {
			return;
		}

		const chapterName = window.location.href.split("chapter=")[1];

		setTimeout(() => {
			scrollToElement(chapterName, this.element);
		}, 50);
	}

	_sendTableOfContentChapters(): void {
		createCustomEvent('psk-send-toc', {
			bubbles: true,
			composed: true,
			cancelable: true,
			detail: {
				chapters: this.chapters,
				active: this.activeChapter
			}
		}, true);
	}

	private __isScrolling: number;

	private __handleScrollEvent = (evt: MouseEvent) => {
		let self = this;
		evt.preventDefault();
		evt.stopImmediatePropagation();

		clearTimeout(this.__isScrolling);

		this.__isScrolling = setTimeout(function () {
			highlightChapter.call(self);
		}, 100);
	}

	connectedCallback() {
		if (this.element.querySelector('psk-toc') !== null) {
			const toc: HTMLElement = this.element.querySelector('psk-toc');
			toc.setAttribute('slot', 'toc');
			this.hasToc = true;
		}
	}

  componentDidLoad() {
    this.componentFullyLoaded = true;
    this._checkForChapterScrolling();
    this._notifyParentAboutCurrentPage();
    this.element.addEventListener('scroll', this.__handleScrollEvent, true);
  }

  _notifyParentAboutCurrentPage() {
    if (this.navigationTitle) {
      let currentPageUrl = window.location.href.replace(window.location.origin,"");
      NavigationTrackerService.notifyParentForChanges(
        {
          currentPageTitle: this.navigationTitle,
          ssappPageUrl: currentPageUrl
        });
    }
  }

	disconnectedCallback() {
		this.element.removeEventListener('scroll', this.__handleScrollEvent, true);
	}
}
