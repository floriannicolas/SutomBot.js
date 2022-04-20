<h1 align="center">
  <br>
  <img src="https://raw.githubusercontent.com/floriannicolas/SutomBot.js/main/images/logo-round.png" alt="SutomBot.js" width="180">
  <br>
</h1>

<h4 align="center">
Modeste solveur pour résoudre les défis journaliers de la plateforme https://sutom.nocle.fr/
<br>
(motivé par les travaux de https://github.com/pil0u/sutom-tob)
</h4>

<p align="center">
  <a href="https://floriannicolas.github.io/SutomBot.js/" target="_blank">DÉMO</a> •
  <a href="#fonctionnalités">Fonctionnalités</a> •
  <a href="#différents-bots">Différents bots</a> •
  <a href="#crédits">Crédits</a> •
  <a href="#licence">Licence</a>
</p>

![screenshot](https://raw.githubusercontent.com/floriannicolas/SutomBot.js/main/images/captures/game-helper.gif)
## Fonctionnalités

* "Game helper" permet de résoudre le défi journalier dde la plateforme https://sutom.nocle.fr/
* "Test bot" permet de tester un bot sur un mot aléatoire ou un mot donné
* "Play yourself" lance une partie aléatoire: à vous de jouer ! 
* "Bot statistics" permet de lancer un bot sur les 10000 premiers mots et affiche les statistiques (les statistiques sont stockées dans le local storage).

---

## Différents bots

![screenshot](https://raw.githubusercontent.com/floriannicolas/SutomBot.js/main/images/captures/statistics.png)


| Version | Description |
| :---: | :---: |
| V1 | <p align="left">Version très basique.<br>Le bot filtre les mots via une regex en utilisant les lettres déclarées comme correctes ou non trouvées.<br>Il n'exploite pas vraiment les lettres jaunes (mal placées).<br>Il propose le premier mot de la liste ainsi filtrée.</p>  |
| V2 | <p align="left">Version améliorée de <strong>V1</strong>.<br>Le bot filtre les mots via une regex en utilisant les lettres déclarées comme correctes ou non trouvées.<br><strong>Il exploite enfin les lettres jaunes (mal placées) en ne gardant que les mot contenant les lettres mal placées.<br>Il propose le mot de la liste filtrée ayant le meilleur score.<br>Le score est calculé par:<br>- le nombre de lettres en commun avec les autres mots possibles.<br>- le nombre de lettre jaunes (mal placées) contenus dans le mot.</strong></p>  |
| V3 |  <p align="left">Version améliorée de <strong>V2</strong>.<br>Le bot filtre les mots via une regex en utilisant les lettres déclarées comme correctes ou non trouvées.<br>Il exploite les lettres jaunes (mal placées)  en ne gardant que les mot contenant les lettres mal placées.<br>Il propose le mot de la liste filtrée ayant le meilleur score.<br>Le score est calculé par:<br>- le nombre de lettres en commun avec les autres mots possibles.<br>- le nombre de lettre jaunes (mal placées) contenus dans le mot.<br><strong>À la première tentative, il augmente le score des mots contenant le plus de voyelles différentes.</strong></p>  |
| V4 |  <p align="left">Version améliorée de <strong>V3</strong>.<br>Le bot filtre les mots via une regex en utilisant les lettres déclarées comme correctes ou non trouvées.<br>Il exploite les lettres jaunes (mal placées)  en ne gardant que les mot contenant les lettres mal placées.<br><strong>De plus il prend en compte l'information sur le nombre max d'un caractère quand elle est disponible (un même caractère est à la fois jaune et bleu : il ne peut y en avoir qu'un)</strong><br>Il propose le mot de la liste filtrée ayant le meilleur score.<br>Le score est calculé par:<br>- le nombre de lettres en commun avec les autres mots possibles.<br>- le nombre de lettre jaunes (mal placées) contenus dans le mot.<br><strong>À la première tentative, il augmente le score des mots contenant le plus de voyelles différentes.</strong></p>  |

---

## Crédits

J'ai créé ce modeste projet motivé par celui de Pil0u : https://github.com/pil0u/sutom-tob 
Vous pouvez le retrouver en stream sur Twitch : https://www.twitch.tv/ze_n0ob

---

## Licence

MIT

---
