<script context="module">
  export async function preload({ params }) {
    // the `slug` parameter is available because
    // this file is called [slug].svelte
    const res = await this.fetch(`/index.json`);
    const data = await res.json();

    if (res.status === 200) {
      return { menu: data };
    } else {
      this.error(res.status, data.message);
    }
  }
</script>

<script>
  import { onMount } from "svelte";
  export let menu;
  let dishes = {};
  let boundingBoxes = {};
  function scroll() {
    Object.keys(dishes).forEach(
      key => (boundingBoxes[key] = dishes[key].getBoundingClientRect())
    );
    // console.log(boundingBoxes);
  }

  onMount(() => scroll());

  function getOpacity(name, boxes = boundingBoxes) {
    let closest = Object.keys(boxes)
      .map(key => ({
        key,
        dist: Math.abs((boxes[key] || {}).y)
      }))
      .sort((a, b) => a.dist - b.dist)[0];
    if (!boxes[name]) return 0;
    if (name === closest.key) return 1;
    return 0;
  }

  function save() {
    window
      .fetch("./index.json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(menu)
      })
      .then(data => data.json())
      .then(data => (menu = data));
    console.log("save");
  }

  function navTo(dish) {
    window.scrollTo(0, window.scrollY + dishes[dish].getBoundingClientRect().y);
  }
</script>

<style>
  :global(body) {
    background-color: rgb(17, 16, 20);
    color: #ddd;
    font-family: "Montserrat", sans-serif;
  }

  .left {
    position: fixed;
    height: 100%;
    width: 100%;
    display: flex;
  }

  .image-wrapper {
    position: absolute;
    width: 30%;
    top: 10%;
    height: 80%;
  }

  .image {
    position: absolute;
    width: 100%;
    height: 100%;
    background-position-x: center;
    background-size: cover;
    transition: all ease-in-out 1s;
  }

  .dishes {
    cursor: pointer;
    position: absolute;
    right: -15%;
    line-height: 0.3rem;
    top: 0%;
    writing-mode: vertical-rl;
    text-orientation: mixed;
  }

  .dish {
    display: inline-block;
    margin: 0.75rem;
    font-family: "Roboto", sans-serif;
    font-size: 1.4rem;
    color: #999;
    text-transform: capitalize;
  }
  hr {
    border: 0;
    height: 1px;
    background-image: linear-gradient(
      to right,
      rgba(0, 0, 0, 0),
      rgba(200, 200, 200, 0.5),
      rgba(0, 0, 0, 0)
    );
  }

  hr.smooth {
    border: 0;
    height: 1px;
    background-image: linear-gradient(
      to right,
      rgba(0, 0, 0, 0),
      rgba(200, 200, 200, 0.1),
      rgba(0, 0, 0, 0)
    );
  }

  h1 {
    font-family: "Roboto", sans-serif;
    letter-spacing: 0.2rem;
    text-transform: capitalize;
  }

  .main {
    position: absolute;
    top: 10%;
    left: 40%;
    height: 80%;
    width: 50%;
  }
  .step {
    padding: 0.5rem;
    margin: 0.25rem;
    letter-spacing: 0.1rem;
  }
  .ingredient {
    padding: 0.1rem;
    letter-spacing: 0.05rem;
    position: relative;
  }

  /* Customize the label (the container) */
  .container {
    position: absolute;
    right: 0;
    padding-right: 2rem;
    margin-bottom: 12px;
    cursor: pointer;
    font-size: 1rem;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  /* Hide the browser's default checkbox */
  .container input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  /* Create a custom checkbox */
  .checkmark {
    position: absolute;
    top: 0;
    right: 0;
    height: 1rem;
    width: 1rem;
    background-color: #00000000;
    border: 1px solid #aaa;
    border-radius: 5px;
    transition: all ease-in-out 0.2s;
  }

  /* On mouse-over, add a grey background color */
  .container:hover input ~ .checkmark {
    background-color: rgb(32, 27, 27);
  }

  /* When the checkbox is checked, add a blue background */
  .container input:checked ~ .checkmark {
    background-color: #00000000;
  }

  /* Create the checkmark/indicator (hidden when not checked) */
  .checkmark:after {
    content: "";
    position: absolute;
    opacity: 0;
    transition: all ease-out 0.2s;
  }

  /* Show the checkmark when checked */
  .container input:checked ~ .checkmark:after {
    opacity: 1;
  }

  /* Style the checkmark/indicator */
  .container .checkmark:after {
    left: 0.4rem;
    top: 0.05rem;
    width: 0.25rem;
    height: 0.5rem;
    border: solid rgb(24, 148, 8);
    border-width: 0 3px 3px 0;
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
  }
</style>

<svelte:head>
  <title>Menu</title>
</svelte:head>
<svelte:window on:scroll={scroll} />
<div class="left">
  <div class="image-wrapper">
    {#each menu.course as dish}
      <div
        class="image"
        style="background-image: url('{dish.image}'); opacity: {getOpacity(dish.name, boundingBoxes)}" />
    {/each}
    <div class="dishes">
      {#each menu.course as dish}
        <div class="dish" on:click={() => navTo(dish.name)}>{dish.name}</div>
      {/each}
    </div>
  </div>
</div>

<div class="main">
  {#each menu.course as dish}
    <div bind:this={dishes[dish.name]}>
      <h1>{dish.name}</h1>
      <h3>{dish.description}</h3>
      <hr />

      {#each dish.ingredients as ingredient}
        <div class="ingredient">
          {ingredient.name}
          <label class="container">
            {ingredient.amount}
            <input
              type="checkbox"
              bind:checked={ingredient.available}
              on:change={save} />
            <span class="checkmark" />
          </label>
        </div>
        <hr class="smooth" />
      {/each}
      {#each dish.steps as step}
        <div class="step">
          {step.step}
          <label class="container">
            <input type="checkbox" bind:checked={step.done} on:change={save} />
            <span class="checkmark" />
          </label>
        </div>
        <hr class="smooth" />
      {/each}
    </div>
  {/each}
</div>
