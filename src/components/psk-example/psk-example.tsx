import { Component, h, Prop, Element } from "@stencil/core";
import { CustomTheme, TableOfContentProperty } from "@cardinal/internals";

/**
 * @disable cheatsheet
 */
@Component({
    tag: "psk-example",
    shadow: true
})

export class PskExample {
    @Element() htmlElement: HTMLElement;

  @CustomTheme()

	@TableOfContentProperty({
		description:`The title of the component's example that will be used to create a psk-chapter.`,
		isMandatory:false,
		propertyType:`string`
	})
	@Prop() title: string = "";

	render() {
        if(!this.htmlElement.isConnected) return null;
        
		return (
			<psk-chapter title={this.title}>
        <div class="example-content">
				  <slot />
        </div>
			</psk-chapter>
		);
	}
}
