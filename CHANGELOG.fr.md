# Journal des modifications

La traduction française de [CHANGELOG.md](CHANGELOG.md), lue par la fenêtre
« Nouveautés » de l'app quand elle est en français. Seules les versions
traduites ici y apparaissent en français ; les autres s'affichent en anglais.
Chaque ligne est marquée :
- 🆕 ce que l'app ne faisait pas avant,
- 🎨 ce qui existait et a été redessiné ou reformulé,
- 🐛 un bug ou une régression corrigés.

## 1.15.0

Le calendrier et les tableaux se pilotent au clavier, les liens des titres et
descriptions s'ouvrent, une tâche terminée s'ouvre depuis le Logbook, une
sélection se déplace d'un bloc, et le panneau de tâche parcourt la liste d'où
il a été ouvert.

🆕 **Le calendrier se pilote au clavier.** Les flèches déplacent le jour
actif, Début/Fin vont aux bouts de sa semaine, Page préc./suiv. changent de
mois (⇧ : d'année), et Entrée ou Espace le choisit — partout où une date se
choisit : une ligne de tâche, la barre de sélection, le compositeur, le
panneau de tâche. Les suggestions du champ de saisie restent visibles pendant
qu'on les parcourt aux flèches, et le champ Date de la barre de sélection
s'ouvre directement sur sa saisie.

🆕 **Les tableaux tournent par pages.** La largeur d'un tableau est partagée
pour qu'un nombre entier de colonnes le remplisse toujours — jamais une colonne
à moitié visible — et les flèches tournent une page entière. Une carte tenue
au bord du tableau pendant un glisser tourne la page elle-même, au lieu de
filer jusqu'à la dernière colonne.

🆕 **« À venir » se groupe par jour, semaine ou mois**, en liste comme en
tableau, trié par date dans chaque groupe par défaut.

🆕 **Les liens des titres et descriptions s'ouvrent.** `[libellé](url)`, une
adresse `https://` seule, et maintenant une adresse sans protocole (`free.fr`)
sont lus comme des liens, dessinés dans le titre — même couleur, soulignés —
plutôt qu'en bleu de lien ordinaire.

🆕 **Une tâche terminée s'ouvre depuis le Logbook.** Un clic ou Entrée ouvre
son panneau, cochée et barrée ; ↑ / ↓ parcourent aussi les lignes du Logbook.
Décocher une tâche ponctuelle n'y affiche plus la ligne « prochaine
occurrence » prévue pour une tâche récurrente.

🆕 **▲ ▼ parcourent la liste depuis le panneau de tâche.** Deux flèches dans
son en-tête, et J / K ou ↑ / ↓ au clavier, ouvrent la tâche précédente ou
suivante dans l'ordre de la page derrière, en gardant cet ordre même quand une
tâche est cochée ou déplacée.

🆕 **Glisser une sélection l'emporte en entier.** La carte glissée repose sur
une pile avec un badge donnant le nombre, les autres lignes choisies
s'estompent pendant le glisser, et lâcher entre deux lignes y dépose toute la
sélection d'un bloc, dans l'ordre où elle a été faite.

🎨 **Un `#projet` choisi dans la liste du compositeur est toujours lu**, quels
que soient les caractères de son nom (`aliasdigital.`, `R&D`, un emoji), et une
longue valeur « projet / section » est coupée par des points de suspension au
lieu de faire défiler le compositeur de côté.

🎨 **Des lignes sélectionnées côte à côte forment un seul bloc**, comme dans
Things, plutôt qu'une pile de pastilles séparées avec une encoche à chaque
jointure.

🐛 **Le curseur clavier et une ligne choisie ne se ressemblent plus.** Une
ligne qui venait d'être désélectionnée gardait la couleur « choisie » du clic
qui l'avait retirée — le curseur est maintenant une bordure, la sélection un
fond.
