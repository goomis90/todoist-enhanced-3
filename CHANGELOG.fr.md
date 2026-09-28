# Journal des modifications

La traduction française de [CHANGELOG.md](CHANGELOG.md), lue par la fenêtre
« Nouveautés » de l'app quand elle est en français. Seules les versions
traduites ici y apparaissent en français ; les autres s'affichent en anglais.
Chaque ligne est marquée :
- 🆕 ce que l'app ne faisait pas avant,
- 🎨 ce qui existait et a été redessiné ou reformulé,
- 🐛 un bug ou une régression corrigés.

## 1.16.0

Après chaque mise à jour, une courte fenêtre vous dit ce qui a changé, la fenêtre de nouvelle tâche se lit plus facilement, et choisir une date se fait de la même façon partout.

🆕 **Voir les nouveautés après une mise à jour.** Quand une nouvelle version apporte du nouveau, une courte fenêtre liste les changements, une seule fois. Vous pouvez la désactiver, et relire toutes les versions, dans Réglages, rubrique À propos.

🆕 **Ajouter une section depuis un tableau.** En vue Tableau d'un projet, la colonne en pointillés « Ajouter une section », à la fin, crée une nouvelle section, la même que depuis la liste.

🆕 **Choisir la largeur d'un tableau.** Un tableau garde maintenant la largeur de l'en-tête de la page, comme une liste. Activez Pleine largeur dans Affichage pour utiliser tout l'écran.

🎨 **Une fenêtre de nouvelle tâche plus claire.** Le titre vient d'abord, avec la description juste en dessous. Ensuite la date, l'échéance, le projet, la priorité, l'estimation et les tags tiennent sur une ligne de petits boutons, et ceux qui sont vides s'affichent en « + Échéance ». Les sous-tâches ont leur propre titre avec leur nombre, et les boutons restent en bas.

🎨 **Un seul sélecteur de date partout.** Le menu date d'une tâche, la barre pour plusieurs tâches sélectionnées, la fenêtre de nouvelle tâche et le panneau de tâche montrent le même sélecteur : tapez une date, choisissez Aujourd'hui, Demain, La semaine prochaine, Cette semaine ou Un jour, ou cliquez sur un jour du mois.

🎨 **Les mots reconnus dans un titre se distinguent mieux.** Les surlignages derrière une date, un projet ou un tag que vous tapez gardent l'espace normal entre les mots : plusieurs à la suite ne se confondent plus.

🎨 **Les cartes d'un tableau gardent leurs boutons dedans.** Au survol, les boutons d'une carte apparaissent dans son coin supérieur, sur la carte même, alignés avec le titre.

🎨 **Tous les menus où l'on tape ont le même champ de recherche.** Déplacer une tâche, choisir des tags, un projet ou une date : le champ en haut a le même aspect et marche pareil.

🎨 **Le bouton Affichage ne compte que les vrais réglages.** Son chiffre augmente quand vous filtrez, groupez ou triez une page autrement que par défaut, plus quand vous passez de liste à tableau (ou de matrice à liste).

🐛 **Ouvrir une tâche ne relit plus son titre.** Un titre enregistré comme « Daily review » reste du texte simple. Seul ce que vous tapez ensuite devient une date, un tag ou une priorité.

🐛 **Taper un tag créait un tag par lettre.** Taper « @week » dans la fenêtre de nouvelle tâche enregistrait « w », « we », « wee » et « week ». Maintenant, seul le tag final est enregistré.

🐛 **La revue suit le panneau de tâche.** Une tâche terminée ou supprimée depuis le panneau quitte tout de suite l'étape de la revue. L'étape « Sans estimation » dit quelles tâches elle liste, et reprend une tâche créée entre-temps.

🐛 **Les menus d'un tableau ou d'une liste courte ne sont plus coupés.** Les menus date, déplacer et plus d'une tâche s'ouvrent toujours en entier, sur toute la page.

## 1.15.0

Les dates et les tableaux se pilotent au clavier, les liens s'ouvrent, et vous passez d'une tâche à la suivante sans la fermer.

🆕 **Choisir une date sans la souris.** Partout où vous choisissez une date (le bouton date d'une tâche, la barre qui apparaît quand plusieurs tâches sont sélectionnées, la fenêtre de nouvelle tâche, le panneau de tâche), les flèches parcourent les jours du mois. Page préc. et Page suiv. changent de mois, et Entrée choisit le jour.

🆕 **Les tableaux défilent page par page.** En vue Tableau, les colonnes tiennent toujours dans l'écran : plus de colonne coupée en deux. Les flèches au-dessus du tableau avancent d'une page entière. Glissez une carte au bord du tableau et la page tourne toute seule.

🆕 **Prochainement se groupe par jour, semaine ou mois.** Ouvrez Affichage sur la page Prochainement et choisissez le regroupement, en liste comme en tableau.

🆕 **Les liens de vos tâches s'ouvrent.** Un lien dans le titre ou la description d'une tâche s'ouvre d'un clic, qu'il soit écrit `[texte](adresse)`, en adresse complète `https://`, ou simplement `site.fr`. Il garde la couleur du texte, souligné.

🆕 **Ouvrir une tâche terminée depuis le Journal.** Dans Analyses, cliquez sur une tâche terminée du Journal (ou appuyez sur Entrée) pour l'ouvrir dans le panneau de tâche. Les flèches haut et bas parcourent aussi le Journal.

🆕 **Passer à la tâche suivante depuis le panneau.** Deux petites flèches en haut du panneau de tâche (ou J / K, ↑ / ↓) ouvrent la tâche précédente ou suivante de la liste d'où vous venez, même après en avoir cochée ou déplacée.

🆕 **Glisser plusieurs tâches d'un coup.** Sélectionnez des tâches avec ⌘-clic, puis glissez-en une : elles partent ensemble en pile avec leur nombre, et arrivent dans l'ordre de votre sélection.

🎨 **Les projets aux noms particuliers marchent dans la fenêtre de nouvelle tâche.** Choisir un `#projet` dans la liste marche toujours, même avec un point, une esperluette ou un emoji dans son nom. Un long « projet / section » est raccourci au lieu d'élargir la fenêtre.

🎨 **Des tâches sélectionnées côte à côte forment un seul bloc**, comme dans Things, plutôt qu'une pile de pastilles séparées.

🐛 **Le repère du clavier et une tâche sélectionnée ne se ressemblent plus.** La tâche où se trouve le clavier a un contour, une tâche sélectionnée un fond coloré : vous voyez tout de suite quand vous en désélectionnez une.
