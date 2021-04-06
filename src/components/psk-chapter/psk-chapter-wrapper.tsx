import { Component, h, Prop, Element } from "@stencil/core";

/**
 * @disable cheatsheet
 */
@Component({
    tag: "psk-chapter-wrapper"
})

export class PskChapterWrapper {
    @Element() htmlElement: HTMLElement;

    @Prop() title: string;

    render() {
        if(!this.htmlElement.isConnected) return null;
        
        return (
            <psk-chapter title={this.title}>
                <div class="sub-card">
                    <slot />
                </div>
            </psk-chapter>
        )
    }
}
