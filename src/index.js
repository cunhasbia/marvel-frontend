import axios from 'axios';
import swal from 'sweetalert';

class App {
  constructor() {
    this.mainContent = document.getElementById('main-content');
    this.charactersContent = document.getElementById('characters-list');
    this.homepageLink = document.getElementById('homepage');
    this.inputSearch = document.getElementById('input-search');
    this.buttonSearch = document.getElementById('button-search');
    this.images = document.getElementsByClassName('img-button');

    this.offset = 0;

    this.getCharacters();
    this.addEvents();
  }

  addEvents() {
    this.buttonSearch.onclick = () => this.searchCharacter();
  }

  async getCharacters(name = null) {
    try {
      let url = `http://localhost:3333/characters?offset=${this.offset}`;

      if (name !== null) {
        url += `&nameStartsWith=${name}`;
      }

      const result = await axios.get(url);

      this.populate(result.data.characters);
      this.pagination(result.data.total);
    } catch (error) {
      console.log(error);
    }
  }

  async getCharacterInfo(id) {
    try {
      const url = `http://localhost:3333/characters/${id}`;

      const result = await axios.get(url);

      this.showCharacterInfo(result.data);
    } catch (error) {
      console.log(error);
    }
  }

  async getComic(id) {
    try {
      const url = `http://localhost:3333/comics/${id}`;

      const result = await axios.get(url);

      this.populateComic(result.data);
    } catch (error) {
      console.log(error);
    }
  }

  populate(data) {
    this.charactersContent.innerHTML = '';

    if (data <= 0) {
      this.charactersContent.innerHTML = `<p><i class="fas fa-exclamation-circle"></i> Oops! Character not found.</p>`;
    }

    data.forEach(item => {
      if (item.thumbnail.path.includes('image_not_available')) {
        const character = `<div class="card m-2" style="width: 200px">
                            <img class="card-img-top img-button" title="${item.name}" data-id="${item.id}" src="./img/marvel_default.png" alt="">
                            <div class="card-body">
                              <h5 class="card-title text-center text-muted">${item.name}</h5>
                            </div>
                          </div>`;

        this.charactersContent.innerHTML += character;
      } else {
        const character = `<div class="card m-2" style="width: 200px">
                            <img class="card-img-top img-button" title="${item.name}" data-id="${item.id}" src="${item.thumbnail.path}.${item.thumbnail.extension}" alt="">
                            <div class="card-body">
                              <h5 class="card-title text-center text-muted">${item.name}</h5>
                            </div>
                          </div>`;

        this.charactersContent.innerHTML += character;
      }
    });

    for (let image of this.images) {
      image.onclick = (event) => this.getCharacterInfo(event.target.dataset.id);
    }
  }

  pagination(total) {
    document.querySelector('.pagination').innerHTML = '';

    const pages = Math.ceil(total / 100);

    for (let i = 1; i <= pages; i++) {
      const li = ` <li class="page-item">
                      <a class="page-link" data-page="${i}" href="#">${i}</a>
                  </li>`;
      document.querySelector('.pagination').innerHTML += li;
    }

    for (let link of document.querySelectorAll('.page-link')) {
      link.onclick = (event) => {
        const page = event.target.dataset.page;
        this.offset = (page - 1) * 100;

        this.getCharacters();
      };
    }
  }

  showCharacterInfo(data) {
    const img = `${data[0].thumbnail.path}.${data[0].thumbnail.extension}`;
    const name = data[0].name;
    let description = data[0].description;
    let comics = data[0].comics.items;

    if (!description) {
      description = 'Description not informed.';
    }

    for (const item of comics) {
      const parts = item.resourceURI.split('comics/');
      const id = parts[1];

      this.getComic(id);
    }

    this.homepageLink.innerHTML = `<i class="fas fa-long-arrow-alt-left mr-2"></i> Back to homepage`;
    this.inputSearch.parentNode.remove();
    this.mainContent.innerHTML = `<div class="row bg-light rounded-top p-3">
                                          <div class="col-12 d-flex">
                                              <div>
                                                <img src="${img}" height="300" alt="">
                                              </div>
                                              <div class="card-body">
                                                <h2 class="card-title mb-3">${name}</h2><hr>
                                                <p class="card-text"><span class="font-weight-bold">Description: </span>${description}</p>
                                              </div>
                                          </div>
                                        </div>
                                        <div class="row bg-light rounded-bottom p-3">
                                          <p class="col-12 font-weight-bold">Comics: </p>
                                          <ul class="col-12" id="hqs"></ul>
                                        </div>`;
  }

  populateComic(comic) {
    let title = comic[0].title.substr(0, 12);

    if (comic[0].title.length >= 12) {
      title += "...";
    }

    const li = `<li class="list-inline-item">
                  <a href="${comic[0].urls[0].url}" target="_blank">
                    <img width="100" src="${comic[0].images[0].path}.${comic[0].images[0].extension}">
                  </a>
                  <p class="text-center">${title}<p>
                </li>`;

    document.querySelector('#hqs').innerHTML += li;
  }

  searchCharacter() {
    const name = this.inputSearch.value.toUpperCase();
    console.log(name);

    (name.length >= 3) ? this.getCharacters(name) : swal('Please, type at least 03 letters to do a search.');
  }
  
}

new App();