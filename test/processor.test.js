const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const processor = require('../processor');

chai.use(sinonChai);
const { expect } = chai;

describe('processor commands', () => {
    describe('#sourceService', () => {
        it('sets the source service', () => {
            expect(processor.sourceService({ source: true })).to.eql({ source: true });
        });

        it('gets the source service', () => {
            expect(processor.sourceService()).to.eql({ source: true });
        });
    });

    describe('#targetService', () => {
        it('sets the target service', () => {
            expect(processor.targetService({ target: true })).to.eql({ target: true });
        });

        it('gets the target service', () => {
            expect(processor.targetService()).to.eql({ target: true });
        });
    });

    describe('#start', () => {
        it('calls generate on the target service', async () => {
            const generateStub = sinon.stub().resolves();
            processor.sourceService({ getSourceItems: () => {} });
            processor.targetService({ generate: generateStub });

            await processor.start({ title: 'gaga' });
            // eslint-disable-next-line no-unused-expressions
            expect(generateStub).to.have.been.called;
        });

        it('calls getSourceItems on the source service', async () => {
            const generateStub = sinon.stub().resolves();
            const getSourceItemsStub = sinon.stub().returns([]);
            processor.sourceService({ getSourceItems: getSourceItemsStub });
            processor.targetService({ generate: generateStub });

            await processor.start({ title: 'gaga' });
            // eslint-disable-next-line no-unused-expressions
            expect(getSourceItemsStub).to.have.been.called;
        });

        it('throws when target service rejects', async () => {
            const generateStub = sinon.stub().rejects();
            processor.sourceService({ getSourceItems: () => {} });
            processor.targetService({ generate: generateStub });

            processor.start({ title: 'gaga' }).catch((ex) => {
                expect(typeof ex).to.eql('object');
            });
        });
    });
});
