class MicroPlugin extends HTMLElement {
  constructor() {
    super();
    this._api = null;
    this._company = null;
    this._wizard = undefined;
    this._steps = [
      { label: "Om Bob", value: "page1", ref: undefined },
      { label: "Historie", value: "page2", ref: undefined },
      { label: "Referanser", value: "page3", ref: undefined },
    ];
    this._template = document.createElement("template");
    this._template.innerHTML = `
        <style>
            .hidden { display: none; }
            .wizard { min-height: calc(100vh - 15rem) }
            footer { padding-bottom: 3rem}
            .label { display: block; }
        </style>
        <article class="mb-4 wizard">
          <img style="height: 100px" src="https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/SpongeBob_SquarePants_character.svg/330px-SpongeBob_SquarePants_character.svg.png" />

            <h1 id="plugin-title">SpongeBob SquarePants</h1>

            <section class="page">
                <h2 class="pagetitle"></h2>SpongeBob SquarePants is the protagonist of the American animated television series of the same name. Voiced by Tom Kenny, he is characterized by his optimism and childlike attitude. SpongeBob is commonly seen hanging out with his friend Patrick Star, working at the Krusty Krab, and attending Mrs. Puff's Boating School, while getting involved in zany hijinks along the way.

SpongeBob was created and designed by Stephen Hillenburg, an artist and marine science educator. The character's name is derived from "Bob the Sponge", the host of Hillenburg's unpublished educational book The Intertidal Zone. He drew the book while teaching marine biology to visitors of the Ocean Institute during the 1980s. Hillenburg began developing a show based on the premise shortly after the 1996 cancellation of Rocko's Modern Life, which Hillenburg directed. SpongeBob's first appearance was in the pilot, "Help Wanted", which premiered on May 1, 1999.

SpongeBob SquarePants has become popular among children and adults. The character has garnered a positive response from media critics and is frequently named as one of the greatest cartoon characters of all time.
            </section>

            <section class="page hidden">
                <h2 class="pagetitle"></h2>
                Early inspirations
Aerial photograph of the Ocean Institute at Dana Point, California
Before creating SpongeBob SquarePants, Stephen Hillenburg taught marine biology to visitors of the Ocean Institute (located in Dana Point, California).[32]
Series' creator Stephen Hillenburg first became fascinated with the ocean as a child and began developing his artistic abilities at a young age. Although these interests would not overlap for some time—the idea of drawing fish seemed boring to him—Hillenburg pursued both during college, majoring in marine biology and minoring in art. After graduating in 1984, he joined the Ocean Institute, an organization in Dana Point, California, dedicated to educating the public about marine science and maritime history.[32][33]

While Hillenburg was there, his love of the ocean began to influence his artistry. He created a precursor to SpongeBob SquarePants: a comic book titled The Intertidal Zone used by the institute to teach visiting students about the animal life of tide pools.[33] The comic starred various anthropomorphic sea lifeforms, many of which would evolve into SpongeBob SquarePants characters.[34] Hillenburg tried to get the comic professionally published, but none of the companies he sent it to were interested.[33]
            </section>

            <section class="page hidden">
                <h2 class="pagetitle"></h2>
                <a href="https://en.wikipedia.org/wiki/SpongeBob_SquarePants">Wikipedia</a>
            </section>

            <section class="page hidden">
                <h2 class="pagetitle"></h2>
            </section>

            <section class="page hidden">
                <h2 class="pagetitle"></h2>
            </section>

        </article>

        <footer class="mt-4 mb-2 flex">
            <button class="secondary mr-4" onClick="help()">Hjelp</button>
            <button class="secondary ml-4" onClick="moveBack()">Tilbake</button>
            <button class="primary c2a" onClick="moveNext()">Videre</button>
        </footer>
    `
  }

  connectedCallback() {
    this.updateUserInterface();
  }

  set api(v) {
    this._api = v;
    this.updateUserInterface();
  }

  updateUserInterface() {
    if (this.ownerDocument.defaultView) {
      if (this.childNodes.length == 0) {
        this.createContent();
        setTimeout(() => { this.setupWizard(); }, 0);
      } else {
        this.updateContent();
      }
    }
  }

  createContent() {
    this.appendChild(this._template.content.cloneNode(true));
    const buttons = this.getElementsByTagName("button");
    if (buttons) {
        buttons[0].addEventListener("click", () => this.help());
        buttons[1].addEventListener("click", () => this.moveBack());
        buttons[2].addEventListener("click", () => this.moveNext());
    }
    this.showPage("page1");
  }

  setupWizard() {
    if (!this._api?.factory) { console.log("No factory"); return; }
    this._wizard = this._api.factory.create("rig-wizard", this);
    if (this._wizard?.instance) {
      const wiz = this._wizard.instance;
      wiz.steps = this._steps;
      wiz.activeStepValue = "page1";
      wiz.ngOnChanges();
      wiz.refresh();
    }
  }

  moveNext() {
    const wiz = this._wizard?.instance;
    if (wiz && wiz.activeIndex < wiz.steps.length - 1) {
      wiz.activeStepValue = wiz.steps[wiz.activeIndex + 1].value;
      this.showPage(wiz.activeStepValue);
      wiz.ngOnChanges();
      wiz.refresh();
    }
  }

  moveBack() {
    const wiz = this._wizard?.instance;
    if (wiz && wiz.activeIndex > 0) {
      wiz.activeStepValue = wiz.steps[wiz.activeIndex - 1].value;
      this.showPage(wiz.activeStepValue);
      wiz.ngOnChanges();
      wiz.refresh();
    }
  }

  help() {
    this._api.showAlert("Help is on the way!!");
  }

  showPage(stepValue) {
    let index = 0;
    for (let step of this._steps) {
        if (!step.ref) step.ref = this.getElementsByClassName("page")[index++];
        if (step.value == stepValue) {
            step.ref.getElementsByClassName("pagetitle")[0].innerText = step.label;
            step.ref.classList.remove("hidden");
        } else {
            step.ref.classList.add("hidden");
        }
    }
  }

  async updateContent() {
    if (this._api) {
        this._company = await this._api.http.get('/api/biz/companysettings/1?select=CompanyName');
    }
  }


}

customElements.define("micro-plugin", MicroPlugin);