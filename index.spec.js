const { superSearchWrapper } = require("./index");

describe("does it trabajo", () => {
  it("sure does", () => {
    const result = superSearchWrapper("./fixtures", "Lorem");

    expect(result).toMatchInlineSnapshot(`
      Array [
        Object {
          "filePath": "./fixtures/level0/0.txt",
          "queryHits": Array [
            Object {
              "line": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque laoreet lobortis consequat. Mauris volutpat urna in sem ullamcorper porttitor. Aenean hendrerit sed nulla id iaculis. Nam eget dui quam. In congue ipsum velit, ut semper eros pulvinar sit amet. Integer quis purus vel magna aliquet mattis sit amet sit amet leo. In ac vulputate mauris, sed vehicula ante. Vestibulum in purus eu nisi molestie porta. Phasellus eget porttitor velit. In nec rhoncus orci, a aliquet quam. Vivamus porta leo vel imperdiet rhoncus.",
              "lineNumber": 1,
              "offset": 0,
            },
          ],
          "totalHits": 1,
        },
        Object {
          "filePath": "./fixtures/level0/level1/level2/2.txt",
          "queryHits": Array [
            Object {
              "line": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas consequat leo viverra magna lacinia, et venenatis arcu ultrices. Donec sit amet interdum ipsum. Donec vestibulum nibh quis lectus hendrerit, ac tempus tortor ultrices. Nullam eros nisl, auctor et ultricies vel, consequat sit amet nisl. Curabitur scelerisque pulvinar eros non dapibus. Duis rhoncus felis diam, venenatis maximus erat tempor sed. Vivamus feugiat, quam at fringilla viverra, nisi lacus efficitur nunc, at luctus ligula massa eu metus. Maecenas consequat commodo metus vel mattis.",
              "lineNumber": 1,
              "offset": 0,
            },
            Object {
              "line": "Vestibulum ac massa sit amet lacus volutpat sodales id vitae mi. Donec vel velit scelerisque, mollis nunc in, ultrices nibh. Etiam pulvinar sodales aliquam. Integer maximus eleifend est in sollicitudin. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum posuere nisl metus, sit amet molestie enim scelerisque nec. Vivamus id accumsan mauris. Etiam in lacus eget felis pretium consectetur. In tortor massa, porttitor in vehicula sit amet, lacinia non orci. Nam eu gravida erat. Vestibulum at est ut erat porttitor egestas in mollis elit. Vestibulum finibus vestibulum eros, ut tempor purus pharetra et. Nullam eget arcu lacus. Nullam et cursus enim. In non enim porta ex condimentum cursus. Aenean efficitur, nibh et dapibus porta, leo dolor tincidunt sem, volutpat gravida augue sem quis nulla.",
              "lineNumber": 19,
              "offset": 203,
            },
          ],
          "totalHits": 2,
        },
        Object {
          "filePath": "./fixtures/level0/level1/1.txt",
          "queryHits": Array [
            Object {
              "line": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus gravida blandit erat, a elementum elit fermentum quis. Suspendisse commodo posuere tincidunt. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Quisque urna nisi, convallis sed urna at, lacinia sodales dui. Vivamus orci lorem, volutpat ac ligula et, placerat imperdiet nisl. Morbi eu molestie leo. Donec nisl nulla, dictum id consectetur eu, porta et velit. Aenean a congue urna, nec semper velit. Proin cursus pellentesque nunc, viverra pretium diam hendrerit consectetur.",
              "lineNumber": 1,
              "offset": 0,
            },
            Object {
              "line": "Cras nulla mauris, pretium et accumsan ut, sodales eget elit. Vivamus efficitur lectus in viverra euismod. Ut lobortis porttitor suscipit. Quisque consequat mollis eros, sed congue mauris facilisis interdum. Duis maximus ornare justo. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed augue purus, dictum sit amet quam at, vestibulum rutrum massa. Mauris non efficitur mi. Maecenas nec neque vitae tortor suscipit interdum. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Ut efficitur turpis dolor, sit amet cursus nisi scelerisque non. Vestibulum sodales ac quam dapibus commodo.",
              "lineNumber": 9,
              "offset": 235,
            },
            Object {
              "line": "Morbi dictum euismod condimentum. Nam maximus orci sed tortor maximus, sed tristique justo eleifend. Morbi nulla neque, placerat vitae enim in, tincidunt varius felis. Pellentesque at nisi at est ornare consequat. Morbi diam est, tristique porta nisi ut, semper posuere erat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer at justo eget augue bibendum interdum. Nam facilisis ligula at dui feugiat aliquet. Proin vitae velit semper, suscipit nisi eget, congue urna. Suspendisse non mauris quis lorem faucibus finibus in non tellus. Phasellus sit amet dictum arcu, at eleifend lacus.",
              "lineNumber": 13,
              "offset": 276,
            },
          ],
          "totalHits": 3,
        },
        Object {
          "filePath": "./fixtures/level0/level1/level2.1/2.1.txt",
          "queryHits": Array [
            Object {
              "line": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi porta venenatis cursus. Vivamus blandit malesuada bibendum. Vivamus bibendum neque id aliquet rhoncus. Pellentesque eget maximus dolor. Fusce porta augue nec sodales fermentum. Quisque faucibus metus quis nisl commodo, a posuere risus vehicula. Cras ut tellus ante. In rutrum pharetra nulla, maximus tempor nunc pellentesque non. Sed mattis egestas scelerisque. Proin suscipit vitae enim vel venenatis. Proin congue in ante ac tempus.",
              "lineNumber": 1,
              "offset": 0,
            },
            Object {
              "line": "Cras et pharetra libero. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nullam ac tortor quam. Morbi vulputate nisi id risus tristique consectetur. Cras et felis et nunc cursus condimentum. Sed at volutpat elit. In et velit semper, volutpat leo id, lobortis neque. Duis ut est lectus. Morbi erat leo, placerat at bibendum ultrices, gravida ac velit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi scelerisque euismod rutrum. Nullam ante magna, pharetra eget massa vulputate, bibendum pharetra turpis. Fusce laoreet lorem sapien, quis tincidunt metus venenatis non. Proin tincidunt quis erat eget vulputate.",
              "lineNumber": 7,
              "offset": 397,
            },
            Object {
              "line": "Mauris ornare risus non purus commodo mattis. Vivamus eget dui quis nisi tempor molestie eget vitae dui. Nullam fringilla ullamcorper semper. Maecenas auctor odio nisl, at pharetra arcu finibus vel. Donec eget velit risus. Cras ligula ipsum, molestie vitae feugiat vel, sodales at nunc. Sed fringilla sagittis vulputate. Nam sodales sit amet turpis a consectetur. Donec vehicula ultricies arcu id tristique. Praesent sit amet metus et eros mattis maximus id a sapien. Proin sagittis blandit tellus eget lobortis. Donec euismod gravida sapien eget ultricies. Fusce vitae massa vitae lectus aliquet feugiat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut vulputate et neque nec finibus.",
              "lineNumber": 17,
              "offset": 606,
            },
          ],
          "totalHits": 3,
        },
      ]
    `);
  });
});
